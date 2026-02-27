import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ShareButton({ className, variant = 'outline', size = 'default' }: ShareButtonProps) {
  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
    >
      <Share2 className="h-5 w-5" />
      <span className="hidden sm:inline ml-2">Share</span>
    </Button>
  );
}
