"use server";

import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function retrieveFileKey(chatId: number) {
  const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
  return _chats[0].fileKey;
}

export async function getChatMessages(chatId: number) {
  const _messages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId));
  return _messages;
}
