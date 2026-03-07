import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

interface UploadVideoParams {
  title: string;
  description: string;
  tags?: string[];
  file: File;
}

export function useVideoUpload() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({
      title,
      description,
      tags = [],
      file,
    }: UploadVideoParams): Promise<string> => {
      if (!actor) throw new Error("Actor not available");

      setUploadProgress(5);

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      setUploadProgress(20);

      const externalBlob = ExternalBlob.fromBytes(
        uint8Array,
      ).withUploadProgress((percentage) =>
        setUploadProgress(20 + Math.floor(percentage * 0.75)),
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const videoId = await (actor as any).uploadVideo(
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
      toast.success("Video uploaded successfully!");
      setUploadProgress(0);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Upload failed.";
      toast.error("Upload failed", { description: message });
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
