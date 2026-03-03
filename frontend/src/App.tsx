import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { VideoGallery } from './pages/VideoGallery';
import { PhotoGallery } from './pages/PhotoGallery';
import { UploadVideo } from './pages/UploadVideo';
import { UploadPhoto } from './pages/UploadPhoto';
import VideoPlayer from './pages/VideoPlayer';
import PhotoViewer from './pages/PhotoViewer';
import { Home } from './pages/Home';
import Settings from './pages/Settings';
import { ChannelProfile } from './pages/ChannelProfile';
import Upgrade from './pages/Upgrade';
import { Shorts } from './pages/Shorts';
import { Subscriptions } from './pages/Subscriptions';
import Profile from './pages/Profile';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

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

const channelProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/channel/$principal',
  component: ChannelProfile,
});

const upgradeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upgrade',
  component: Upgrade,
});

const shortsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shorts',
  component: Shorts,
});

const subscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/subscriptions',
  component: Subscriptions,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailure,
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
  channelProfileRoute,
  upgradeRoute,
  shortsRoute,
  subscriptionsRoute,
  profileRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
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
