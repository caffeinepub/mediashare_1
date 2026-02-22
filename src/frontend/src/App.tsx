import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { VideoGallery } from './pages/VideoGallery';
import { PhotoGallery } from './pages/PhotoGallery';
import { UploadVideo } from './pages/UploadVideo';
import { UploadPhoto } from './pages/UploadPhoto';
import { VideoPlayer } from './pages/VideoPlayer';
import { PhotoViewer } from './pages/PhotoViewer';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const videosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/videos',
  component: VideoGallery,
});

const photosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/photos',
  component: PhotoGallery,
});

const uploadVideoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload-video',
  component: UploadVideo,
});

const uploadPhotoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload-photo',
  component: UploadPhoto,
});

const videoPlayerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/video/$id',
  component: VideoPlayer,
});

const photoViewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/photo/$id',
  component: PhotoViewer,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  videosRoute,
  photosRoute,
  uploadVideoRoute,
  uploadPhotoRoute,
  videoPlayerRoute,
  photoViewerRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
