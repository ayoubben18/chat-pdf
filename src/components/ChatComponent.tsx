"use client";
import React, { useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ArrowUp } from "lucide-react";
import { useChat } from "ai/react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import { Message } from "ai";
import axios from "axios";

type Props = {
  chatId: number;
  fileKey: string;
};

const ChatComponent = ({ chatId, fileKey }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: [fileKey],
    queryFn: async () => {
      const response = await axios.post<Message[]>(`/api/get-messages`, {
        chatId,
      });
      return response.data;
    },
  });
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      fileKey,
      chatId,
    },
    initialMessages: data || [],
  });

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
    return () => {};
  }, [messages]);

  return (
    <div
      id="message-container"
      className="  max-h-screen h-full w-full overflow-y-scroll flex flex-col"
    >
      <div className=" sticky top-4 inset-x-0 p-2 h-fit">
        <h3 className=" text-xl font-bold">Chat</h3>
      </div>
      <div className=" px-2 py-4">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <form onSubmit={handleSubmit} className="flex sticky bottom-2 gap-1 px-4">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your Question"
        />
        <Button type="submit" disabled={isLoading}>
          <ArrowUp className=" w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatComponent;
