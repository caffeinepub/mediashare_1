import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function Subscriptions() {
  const { identity } = useInternetIdentity();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Users className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Subscriptions</h1>
      {identity ? (
        <>
          <p className="text-muted-foreground text-lg max-w-md">
            Channel subscriptions are coming soon! You'll be able to follow your
            favorite creators and never miss their latest videos.
          </p>
          <div className="mt-8 flex gap-2 items-center text-sm text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            Coming Soon
          </div>
        </>
      ) : (
        <>
          <p className="text-muted-foreground text-lg max-w-md mb-6">
            Sign in to subscribe to channels and keep up with your favorite
            creators.
          </p>
          <Link to="/">
            <Button size="lg" className="gap-2">
              <Users className="w-5 h-5" />
              Browse Channels
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
