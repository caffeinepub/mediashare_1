import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Video, Image, Upload, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function Home() {
  return (
    <div className="w-full">
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-chart-1/20 via-chart-2/20 to-chart-3/20">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(/assets/generated/hero-banner.dim_1200x400.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Share Your <span className="text-chart-1">Moments</span> with the World
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Upload, share, and discover amazing photos and videos on a decentralized platform built on the Internet Computer.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link to="/videos">
                <Button size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Browse Videos
                </Button>
              </Link>
              <Link to="/photos">
                <Button size="lg" variant="outline" className="gap-2">
                  <Image className="w-5 h-5" />
                  Browse Photos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Sharing Today</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your content and join our growing community of creators
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link to="/upload-video">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:border-chart-1 cursor-pointer h-full">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Upload Video</h3>
                <p className="text-muted-foreground">
                  Share your video content with the community. Support for all major video formats.
                </p>
                <Button variant="outline" className="gap-2 mt-4">
                  <Upload className="w-4 h-4" />
                  Upload Video
                </Button>
              </CardContent>
            </Card>
          </Link>
          <Link to="/upload-photo">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:border-chart-2 cursor-pointer h-full">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-chart-2 to-chart-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Image className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Upload Photo</h3>
                <p className="text-muted-foreground">
                  Share your best photos and memories. High-quality image support included.
                </p>
                <Button variant="outline" className="gap-2 mt-4">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why MediaShare?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-chart-1/20 flex items-center justify-center mx-auto">
                <Video className="w-8 h-8 text-chart-1" />
              </div>
              <h3 className="text-xl font-semibold">Decentralized</h3>
              <p className="text-muted-foreground">
                Built on the Internet Computer for true ownership and permanence
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-chart-2/20 flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold">Easy Upload</h3>
              <p className="text-muted-foreground">
                Simple and intuitive interface for uploading your content
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-chart-3/20 flex items-center justify-center mx-auto">
                <Image className="w-8 h-8 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold">High Quality</h3>
              <p className="text-muted-foreground">
                Support for high-resolution photos and videos
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
