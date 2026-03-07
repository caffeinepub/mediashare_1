import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { useState } from "react";

interface VideoQualitySelectorProps {
  className?: string;
}

type QualityOption = "auto" | "360p" | "480p" | "720p" | "1080p";

export function VideoQualitySelector({
  className = "",
}: VideoQualitySelectorProps) {
  const [selectedQuality, setSelectedQuality] = useState<QualityOption>("auto");

  const qualityOptions: { value: QualityOption; label: string }[] = [
    { value: "auto", label: "Auto" },
    { value: "360p", label: "360p" },
    { value: "480p", label: "480p" },
    { value: "720p", label: "720p" },
    { value: "1080p", label: "1080p" },
  ];

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Quality: {selectedQuality}</span>
            <span className="sm:hidden">{selectedQuality}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {qualityOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setSelectedQuality(option.value)}
              className={selectedQuality === option.value ? "bg-accent" : ""}
            >
              {option.label}
              {selectedQuality === option.value && " ✓"}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-xs text-muted-foreground mt-2">
        Note: Quality selection is limited by browser capabilities and video
        source
      </p>
    </div>
  );
}
