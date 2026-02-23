import { Link, useNavigate } from '@tanstack/react-router';
import { AuthButton } from './AuthButton';
import { ProfileSetupModal } from './ProfileSetupModal';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Video, Image, Upload, Home, Settings as SettingsIcon, Crown } from 'lucide-react';
import { SiX, SiFacebook, SiInstagram } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const currentYear = new Date().getFullYear();
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ProfileSetupModal />
      
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              MediaShare
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link
                to="/videos"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Videos
              </Link>
              <Link
                to="/photos"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Image className="w-4 h-4" />
                Photos
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: '/upload-video' })}>
                  <Video className="w-4 h-4 mr-2" />
                  Upload Video
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/upload-photo' })}>
                  <Image className="w-4 h-4 mr-2" />
                  Upload Photo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/upgrade' })}
                  className="gap-2 text-chart-1 hover:text-chart-1"
                >
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline">Upgrade</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/settings' })}
                  className="gap-2"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </>
            )}
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
                  <Video className="w-4 h-4 text-white" />
                </div>
                MediaShare
              </div>
              <p className="text-sm text-muted-foreground">
                Share your photos and videos with the world. Built on the Internet Computer.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/videos" className="hover:text-foreground transition-colors">
                    Browse Videos
                  </Link>
                </li>
                <li>
                  <Link to="/photos" className="hover:text-foreground transition-colors">
                    Browse Photos
                  </Link>
                </li>
                <li>
                  <Link to="/upload-video" className="hover:text-foreground transition-colors">
                    Upload Video
                  </Link>
                </li>
                <li>
                  <Link to="/upload-photo" className="hover:text-foreground transition-colors">
                    Upload Photo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Connect</h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="X"
                >
                  <SiX className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Facebook"
                >
                  <SiFacebook className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Instagram"
                >
                  <SiInstagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>
              © {currentYear} MediaShare. Built with love using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'mediashare'
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
    </div>
  );
}
