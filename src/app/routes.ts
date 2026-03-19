import { createBrowserRouter } from "react-router";
import { VideoTypePage } from "./pages/video-type-page";
import { HomePage } from "./pages/home-page";
import { ProcessingPage } from "./pages/processing-page";
import { ResultPage } from "./pages/result-page";

// Edit Existing Video
import { EditVideoUploadScreen } from "./pages/edit-video/upload-screen";
import { EditVideoProcessingScreen } from "./pages/edit-video/processing-screen";
import { EditVideoDashboard } from "./pages/edit-video/editor-dashboard";

// Images to Video
import { ImagesToVideoUploadScreen } from "./pages/images-to-video/upload-screen";
import { ImagesToVideoArrangeScreen } from "./pages/images-to-video/arrange-screen";
import { ImagesToVideoStyleScreen } from "./pages/images-to-video/style-screen";
import { ImagesToVideoPreviewScreen } from "./pages/images-to-video/preview-screen";

// Quick AI Edit
import { QuickEditUploadScreen } from "./pages/quick-edit/upload-screen";
import { QuickEditStyleScreen } from "./pages/quick-edit/style-screen";
import { QuickEditProcessingScreen } from "./pages/quick-edit/processing-screen";
import { QuickEditResultScreen } from "./pages/quick-edit/result-screen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: VideoTypePage,
  },
  // AI Generated Video (original flow)
  {
    path: "/create",
    Component: HomePage,
  },
  {
    path: "/processing",
    Component: ProcessingPage,
  },
  {
    path: "/result",
    Component: ResultPage,
  },
  // Edit Existing Video
  {
    path: "/edit-video/upload",
    Component: EditVideoUploadScreen,
  },
  {
    path: "/edit-video/processing",
    Component: EditVideoProcessingScreen,
  },
  {
    path: "/edit-video/editor",
    Component: EditVideoDashboard,
  },
  // Images to Video
  {
    path: "/images-to-video/upload",
    Component: ImagesToVideoUploadScreen,
  },
  {
    path: "/images-to-video/arrange",
    Component: ImagesToVideoArrangeScreen,
  },
  {
    path: "/images-to-video/style",
    Component: ImagesToVideoStyleScreen,
  },
  {
    path: "/images-to-video/preview",
    Component: ImagesToVideoPreviewScreen,
  },
  // Quick AI Edit
  {
    path: "/quick-edit/upload",
    Component: QuickEditUploadScreen,
  },
  {
    path: "/quick-edit/style",
    Component: QuickEditStyleScreen,
  },
  {
    path: "/quick-edit/processing",
    Component: QuickEditProcessingScreen,
  },
  {
    path: "/quick-edit/result",
    Component: QuickEditResultScreen,
  },
]);