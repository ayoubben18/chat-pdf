"use client";
import { DBChats } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";

interface Props {
  chats: DBChats[];
  chatId: number;
}

const ChatSideBar = ({ chats, chatId }: Props) => {
  return (
    <div className=" w-full h-screen overflow-y-scroll p-4 text-gray-200 bg-gray-900">
      <Link href="/">
        <Button className=" w-full">
          <PlusCircle className=" mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>
      <div className="flex flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <Button
              className={
                chat.id === chatId
                  ? " bg-slate-500 w-full"
                  : " border border-dashed w-full border-white"
              }
              disabled={chat.id === chatId}
            >
              <p className=" overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName}
              </p>
            </Button>
          </Link>
        ))}
      </div>

      <div className=" absolute bottom-4 left-4">
        <div className=" flex items-center gap-2 text-sm text-slate-500 text-wrap">
          <Link href="/">Home</Link>
          <Link href="/">Source</Link>
          {/* stripe button */}
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;
