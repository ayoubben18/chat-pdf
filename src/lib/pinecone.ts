import { Pinecone } from "@pinecone-database/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { downloadFromS3 } from "./s3-server";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";
export function getPinecone() {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  return pc;
}

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: {
      pageNumber: number;
    };
    source: string;
  };
};
export type PineconeElement = {
  id: string;
  values: number[];
  metadata: {
    text: string;
    pageNumber: string;
  };
};

export async function loadS3intoPinecone(file_key: string) {
  // 1 - obtain the pdf -> downlaod and read from the pdf
  console.log("Downloading S3 into file system...");
  const fileName = await downloadFromS3(file_key);
  if (!fileName) {
    throw new Error("Could not download file from S3");
  }
  const loader = new PDFLoader(fileName);
  const pages = (await loader.load()) as PDFPage[];

  // 2- slpit and segment the pdf into smaller docs
  const documents = await Promise.all(pages.map(prepareDocuments));

  // 3- vectorize the docs
  const vectors = await Promise.all(documents.flat().map(embedDocuments));

  // 4- upload to pinecone
  const client = await getPinecone();
  const pineconeIndex = client.Index("chat-pdf");

  console.log("Uploading to pinecone...");
  const namespace = pineconeIndex.namespace(convertToAscii(file_key));

  await namespace.upsert(vectors);

  return documents[0];
}

async function embedDocuments(document: Document) {
  try {
    const embeddings = await getEmbeddings(document.pageContent);
    const hash = md5(document.pageContent);
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: document.metadata.text,
        pageNumber: document.metadata.pageNumber,
      },
    } as PineconeElement;
  } catch (error) {
    console.log("Error embedding document", error);
    throw error;
  }
}
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

export async function prepareDocuments(page: PDFPage) {
  let { pageContent, metadata } = page;
  // replace the regex with empty string
  pageContent = pageContent.replace(/\n/g, " ");
  // split the text into smaller chunks
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
