import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/home-page";
import { ProcessingPage } from "./pages/processing-page";
import { ResultPage } from "./pages/result-page";

export const router = createBrowserRouter([
  {
    path: "/",
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
]);
