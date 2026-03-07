import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, Share2, Upload } from "lucide-react";
import { useState } from "react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { AdSenseScript } from "./AdSenseScript";
import { AdSenseUnit } from "./AdSenseUnit";
import { AuthButton } from "./AuthButton";
import { BottomNav } from "./BottomNav";
import { ProfileSetupModal } from "./ProfileSetupModal";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const currentYear = new Date().getFullYear();
  const isAuthenticated = !!identity;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background dark">
      <ProfileSetupModal />
      <AdSenseScript />

      {/* Header: overflow visible so dropdowns can escape */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="flex h-16 items-center px-4 gap-2 sm:gap-4">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg hidden sm:block">
                  Media Share
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Search bar (hidden on mobile) */}
          <div className="flex-1 max-w-2xl mx-auto hidden md:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search"
                className="w-full h-10 pl-4 pr-12 rounded-full border-border bg-background"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-12 rounded-r-full hover:bg-accent"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Spacer on mobile to push right section to the right */}
          <div className="flex-1 md:hidden" />

          {/* Right: Upload (authenticated) + Auth buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: "/upload-video" })}
                className="flex-shrink-0"
              >
                <Upload className="w-5 h-5" />
              </Button>
            )}
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 overflow-x-hidden">
          {/* Main content */}
          <main className="flex-1 pb-16 sm:pb-20">{children}</main>

          {/* Desktop sidebar ad unit */}
          <aside className="hidden xl:block w-64 flex-shrink-0 px-3 py-6 border-l border-border">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
              Sponsored
            </p>
            <AdSenseUnit
              adSlot="sidebar-ad-slot"
              adFormat="vertical"
              className="min-h-[250px]"
            />
          </aside>
        </div>
      </div>

      <footer className="border-t border-border bg-card mb-16 sm:mb-20">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Share2 className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold text-base">Media Share</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Share your videos and photos with the world. Built on the
                Internet Computer.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/videos"
                    className="hover:text-foreground transition-colors"
                  >
                    Browse Videos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/upload-video"
                    className="hover:text-foreground transition-colors"
                  >
                    Upload Video
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Connect</h3>
              <div className="flex gap-3">
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="X"
                >
                  <SiX className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Facebook"
                >
                  <SiFacebook className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Instagram"
                >
                  <SiInstagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              © {currentYear} Media Share. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== "undefined"
                    ? window.location.hostname
                    : "mediashare",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Fixed bottom navigation bar */}
      <BottomNav />
    </div>
  );
}
