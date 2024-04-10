import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";
import { PineconeElement } from "./pinecone";

export async function getMatchesFromEmbeddings(
  embedding: number[],
  fileKey: string
) {
  // Pinecone client
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const index = pc.Index("chat-pdf");
  try {
    const namespace = index.namespace(convertToAscii(fileKey));
    const queryResult = await namespace.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );

  type Metadata = PineconeElement["metadata"];

  let docs = qualifyingDocs.map((match) => {
    return (match.metadata as Metadata).text;
  });
  return docs.join("\n").substring(0, 3000);
}
