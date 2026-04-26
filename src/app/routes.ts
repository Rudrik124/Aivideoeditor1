import { createBrowserRouter } from "react-router";
import { VideoTypePage } from "./pages/video-type-page";
import { FeaturesSelectionPage } from "./pages/features-selection";
import { HomePage } from "./pages/home-page";
import { AuthCallbackPage } from "./pages/Auth/auth-callback";
import { AIGenerativeVideoPage } from "./pages/AI-Video_Generation/ai-generative-video";
import { ProcessingPage } from "./pages/AI-Video_Generation/processing";
import { ResultPage } from "./pages/AI-Video_Generation/result";

// Generate Using Reference Video
import { ReferenceVideoSetupScreen } from "./pages/reference-video/setup-screen";
import { ReferenceVideoProcessingScreen } from "./pages/reference-video/processing-screen";
import { ReferenceVideoResultScreen } from "./pages/reference-video/result-screen";

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
  {
    path: "/auth/callback",
    Component: AuthCallbackPage,
  },
  {
    path: "/features",
    Component: FeaturesSelectionPage,
  },
  // AI Generated Video (original flow)
  {
    path: "/create",
    Component: AIGenerativeVideoPage,
  },
  {
    path: "/home",
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
  // Generate Using Reference Video
  {
    path: "/reference-video/setup",
    Component: ReferenceVideoSetupScreen,
  },
  {
    path: "/reference-video/processing",
    Component: ReferenceVideoProcessingScreen,
  },
  {
    path: "/reference-video/result",
    Component: ReferenceVideoResultScreen,
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