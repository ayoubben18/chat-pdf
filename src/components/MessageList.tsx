import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2 } from "lucide-react";
import React from "react";

type Props = {
  isLoading: boolean;
  messages: Message[];
};

const MessageList = ({ messages, isLoading }: Props) => {
  if (!messages) return <div></div>;
  if (isLoading)
    return (
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 text-slate-300 animate-spin" />
      </div>
    );
  return (
    <div className=" flex flex-col gap-2 ">
      {messages.map((message) => (
        <div
          className={cn("flex", {
            "justify-end": message.role === "user",
            "justify-start": message.role === "system",
          })}
          key={message.id}
        >
          <div
            className={cn(
              "rounded-lg px-2 text-sm py-1 shadow-md ring-1 ring-gray-900/10 ",
              {
                "bg-slate-200 text-slate-950": message.role === "user",
                "bg-slate-800":
                  message.role === "system" || message.role === "assistant",
              }
            )}
          >
            <p>{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
