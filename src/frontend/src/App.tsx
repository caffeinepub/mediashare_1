import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import ChannelProfile from "./pages/ChannelProfile";
import { Home } from "./pages/Home";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentSuccess from "./pages/PaymentSuccess";
import { PhotoGallery } from "./pages/PhotoGallery";
import PhotoViewer from "./pages/PhotoViewer";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { Shorts } from "./pages/Shorts";
import { Subscriptions } from "./pages/Subscriptions";
import Upgrade from "./pages/Upgrade";
import { UploadPhoto } from "./pages/UploadPhoto";
import { UploadVideo } from "./pages/UploadVideo";
import { VideoGallery } from "./pages/VideoGallery";
import VideoPlayer from "./pages/VideoPlayer";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const videosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/videos",
  component: VideoGallery,
});

const photosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/photos",
  component: PhotoGallery,
});

const uploadVideoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upload-video",
  component: UploadVideo,
});

const uploadPhotoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upload-photo",
  component: UploadPhoto,
});

const videoPlayerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/video/$id",
  component: VideoPlayer,
});

const photoViewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/photo/$id",
  component: PhotoViewer,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});

const channelProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/channel/$principal",
  component: ChannelProfile,
});

const upgradeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upgrade",
  component: Upgrade,
});

const shortsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shorts",
  component: Shorts,
});

const subscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subscriptions",
  component: Subscriptions,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
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

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
