import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useSetCustomThumbnail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({
      videoId,
      imageFile,
    }: { videoId: string; imageFile: File }) => {
      if (!actor) throw new Error("Actor not available");

      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const blobWithProgress = ExternalBlob.fromBytes(
        uint8Array,
      ).withUploadProgress((percentage) => setUploadProgress(percentage));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).setCustomThumbnail(videoId, blobWithProgress);
    },
    onSuccess: (_data, { videoId }) => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Thumbnail updated!");
      setUploadProgress(0);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to upload thumbnail.";
      toast.error("Thumbnail upload failed", { description: message });
      setUploadProgress(0);
    },
  });

  return {
    setCustomThumbnail: mutation.mutateAsync,
    isUploading: mutation.isPending,
    uploadProgress,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
}
