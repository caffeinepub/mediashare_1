import React from 'react';
import { DollarSign, TrendingUp, Eye, Video, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAdRevenueForCaller } from '../hooks/useGetAdRevenueForCaller';
import { useGetAdRevenueForVideo } from '../hooks/useGetAdRevenueForVideo';
import { useVideos } from '../hooks/useVideos';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { VideoMetadata } from '../backend';

function VideoRevenueRow({ video }: { video: VideoMetadata }) {
  const { data, isLoading } = useGetAdRevenueForVideo(video.id);

  return (
    <TableRow>
      <TableCell className="font-medium max-w-[200px] truncate">{video.title}</TableCell>
      <TableCell className="text-right">
        {isLoading ? (
          <Skeleton className="h-4 w-12 ml-auto" />
        ) : (
          Number(data?.impressions ?? 0).toLocaleString()
        )}
      </TableCell>
      <TableCell className="text-right">
        {isLoading ? (
          <Skeleton className="h-4 w-16 ml-auto" />
        ) : (
          <span className="text-green-600 dark:text-green-400 font-medium">
            ${(data?.totalRevenue ?? 0).toFixed(2)}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function AdRevenueDashboard() {
  const { identity } = useInternetIdentity();
  const { data: totalRevenue, isLoading: revenueLoading } = useGetAdRevenueForCaller(!!identity);
  const { data: videos, isLoading: videosLoading } = useVideos();

  if (!identity) return null;

  const myVideos = videos?.filter(
    (v) => v.uploader.toString() === identity.getPrincipal().toString()
  ) ?? [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ad Earnings
            </CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                ${(totalRevenue ?? 0).toFixed(2)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Lifetime earnings from ad impressions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Videos Monetized
            </CardTitle>
            <Video className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {videosLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{myVideos.length}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Videos earning ad revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* CPM Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              Current CPM rate: <span className="font-semibold text-foreground">$2.00</span> per 1,000 impressions
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Per-Video Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Per-Video Revenue Breakdown
          </CardTitle>
          <CardDescription>
            Ad impressions and earnings for each of your videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {videosLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : myVideos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No videos uploaded yet.</p>
              <p className="text-xs mt-1">Upload videos to start earning ad revenue.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video Title</TableHead>
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
