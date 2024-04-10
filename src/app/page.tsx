import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { auth, UserButton } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  return (
    <div className="w-screen min-h-screen">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className=" mr-3 text-5xl font-semibold">Chat PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div className="flex mt-2">
            {isAuth && <Button>Visit Chats</Button>}
          </div>
          <p className=" max-w-xl mt-1 text-lg text-slate-500">
            Join Us to chat with your pdf
          </p>
          <div className=" w-full mt-4">
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login to chat <LogIn className="ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
