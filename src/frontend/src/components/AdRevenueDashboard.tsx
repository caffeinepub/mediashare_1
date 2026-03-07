import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Eye, TrendingUp } from "lucide-react";
import React from "react";
import { useGetAdRevenueForCaller } from "../hooks/useGetAdRevenueForCaller";
import { useGetAdRevenueForVideo } from "../hooks/useGetAdRevenueForVideo";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useVideos } from "../hooks/useVideos";
import type { VideoMetadata } from "../lib/types";

function VideoRevenueRow({ video }: { video: VideoMetadata }) {
  const { data: revenueData } = useGetAdRevenueForVideo(video.id);

  return (
    <TableRow>
      <TableCell className="font-medium max-w-[200px] truncate">
        {video.title}
      </TableCell>
      <TableCell className="text-right">
        {revenueData ? Number(revenueData.impressions).toLocaleString() : "—"}
      </TableCell>
      <TableCell className="text-right">
        {revenueData ? (
          <span className="text-green-600 dark:text-green-400 font-medium">
            ${revenueData.totalRevenue.toFixed(2)}
          </span>
        ) : (
          "—"
        )}
      </TableCell>
    </TableRow>
  );
}

export function AdRevenueDashboard() {
  const { identity } = useInternetIdentity();
  const { data: totalRevenue, isLoading: revenueLoading } =
    useGetAdRevenueForCaller();
  const { data: videos, isLoading: videosLoading } = useVideos();

  if (!identity) return null;

  const myVideos =
    videos?.filter(
      (v) => v.uploader.toString() === identity.getPrincipal().toString(),
    ) ?? [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Total Ad Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                ${(totalRevenue ?? 0).toFixed(2)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings from ad impressions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Videos Monetized
            </CardTitle>
          </CardHeader>
          <CardContent>
            {videosLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                {myVideos.length}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Videos earning ad revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CPM Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              Current CPM rate:{" "}
              <span className="font-semibold text-foreground">$2.00</span> per
              1,000 impressions
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Per-Video Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Per-Video Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {videosLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : myVideos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No videos uploaded yet. Upload videos to start earning ad revenue.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myVideos.map((video) => (
                  <VideoRevenueRow key={video.id} video={video} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdRevenueDashboard;
