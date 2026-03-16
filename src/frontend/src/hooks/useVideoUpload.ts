import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";

interface UploadVideoParams {
  title: string;
  description: string;
  tags?: string[];
  file: File;
  actor: any;
}

export function useVideoUpload() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({
      title,
      description,
      tags = [],
      file,
      actor,
    }: UploadVideoParams): Promise<string> => {
      if (!actor) {
        throw new Error("Backend se connection nahi hua. Page reload karein.");
      }

      setUploadProgress(5);

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      setUploadProgress(10);

      const externalBlob = ExternalBlob.fromBytes(
        uint8Array,
      ).withUploadProgress((percentage) =>
        setUploadProgress(10 + Math.floor(percentage * 85)),
      );

      const videoId = await actor.uploadVideo(
        title,
        description,
        tags,
        externalBlob,
      );

      setUploadProgress(100);
      return videoId as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Video upload ho gayi!");
      setUploadProgress(0);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Upload fail hua.";
      toast.error("Upload fail hua", { description: message });
      setUploadProgress(0);
    },
  });

  const reset = () => {
    mutation.reset();
    setUploadProgress(0);
  };

  return {
    uploadVideo: mutation.mutateAsync,
    isUploading: mutation.isPending,
    uploadProgress,
    error: mutation.error instanceof Error ? mutation.error.message : null,
    isSuccess: mutation.isSuccess,
    reset,
  };
}
