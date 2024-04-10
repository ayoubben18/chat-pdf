import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { getS3Url } from "@/lib/db/s3";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    id: string;
  };
};

const page = async ({ params: { id } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const _chats = await db.select().from(chats).where(eq(chats.usersId, userId));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(id))) {
    return redirect("/");
  }
  const currentChat = _chats.find((chat) => chat.id === parseInt(id));
  if (!currentChat) {
    return redirect("/");
  }
  console.log(currentChat.pdfUrl);

  return (
    <div className=" flex max-h-screen ">
      {/* chat Sidebar */}
      <div className=" flex-[1] max-w-xs">
        <ChatSideBar chatId={parseInt(id)} chats={_chats} />
      </div>
      {/* pdf viewer */}
      <div className=" max-h-screen p-4 flex-[5]">
        <PDFViewer pdfUrl={currentChat.pdfUrl} />
      </div>
      {/* chat component */}
      <div className=" flex-[3] border-l-4 border-l-slate-200">
        <ChatComponent chatId={parseInt(id)} fileKey={currentChat.fileKey} />
      </div>
    </div>
  );
};

export default page;
