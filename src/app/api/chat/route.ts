// import OpenAI from "openai";
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//   });
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { messages as DrizzleMessages } from "@/lib/db/schema";
import { Message } from "ai/react";
// IMPORTANT! Set the runtime to edge

// export const runtime = "edge";

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const { messages, fileKey, chatId } = await req.json();
    console.log(fileKey);

    if (!fileKey) {
      return new Response("Chat Id not found !!", {
        status: 400,
      });
    }

    const lastMessage = messages[messages.length - 1];
    console.log("getting the context");

    const context = await getContext(lastMessage.content, fileKey);
    console.log("context received");

    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };
    console.log("sending to openai");

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      // messages,
      messages: [prompt, ...messages.filter((m: Message) => m.role === "user")],
      stream: true,
    });
    const stream = OpenAIStream(response, {
      onStart: async () => {
        //save the user message into the db
        await db.insert(DrizzleMessages).values({
          chatId,
          content: lastMessage.content,
          role: "user",
        });
      },
      onCompletion: async (completion) => {
        //save the assistant message into the db
        await db.insert(DrizzleMessages).values({
          chatId,
          content: completion,
          role: "system",
        });
      },
    });

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log(error);
    return new Response("Error", {
      status: 500,
    });
  }
}
