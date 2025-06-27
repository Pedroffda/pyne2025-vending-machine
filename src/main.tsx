import { Toaster } from "@/components/ui/sonner.tsx";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback="loading...">
      <App />
      <Toaster />
    </Suspense>
  </StrictMode>
);
