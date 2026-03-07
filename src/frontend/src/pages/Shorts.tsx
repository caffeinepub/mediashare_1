import { PlaySquare } from "lucide-react";

export function Shorts() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <PlaySquare className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Shorts</h1>
      <p className="text-muted-foreground text-lg max-w-md">
        Short-form videos are coming soon! Stay tuned for quick, fun clips from
        your favorite creators.
      </p>
      <div className="mt-8 flex gap-2 items-center text-sm text-muted-foreground">
        <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
        Coming Soon
      </div>
    </div>
  );
}
