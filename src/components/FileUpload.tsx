"use client";
import { Inbox, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "./ui/use-toast";
import { uploadToS3 } from "@/lib/db/s3";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { toast } = useToast();
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      setUploading(true);
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file less than 10MB.",
        });
        return;
      }
      try {
        const data = await uploadToS3(file);
        if (!data?.file_key || !data?.file_name) {
          toast({
            variant: "destructive",
            title: "Something went wrong",
            description: "Please try again later.",
          });
          return;
        }
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast({
              title: "Chat created",
              description: "Your chat has been created successfully.",
            });
            router.push(`/chat/${chat_id}`);
          },
          onError: (error) => {
            toast({
              variant: "destructive",
              title: "Error Creating Chat",
              description: "Please try again later.",
            });
            console.error(error);
          },
        });
        toast({
          title: "File uploaded",
          description: "Your file has been uploaded successfully.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error uploading file",
          description: "Please try again later.",
        });
      } finally {
        setUploading(false);
      }
    },
  });
  return (
    <div className=" p-2 bg-slate-600 rounded-xl">
      <div
        {...getRootProps({
          className:
            " border-dashed border-2 py-8 flex justify-center items-center rounded-xl cursor-pointer bg-slate-500 flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-slate-300 animate-spin" />
            <p className="mt-2 text-sm text-slate-300">Uploading...</p>
          </div>
        ) : (
          <>
            <Inbox className=" w-10 h-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-300">Upload your pdf</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
