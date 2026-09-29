import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Register Service Worker for PWA (offline caching, mini-app installation)
registerSW({
  immediate: true,
  onRegistered(r) {
    if (r) {
      console.log("AvyLink PWA Service Worker active:", r.scope);
    }
  },
  onRegisterError(error) {
    console.warn("AvyLink PWA registration notice:", error);
  },
});

createRoot(document.getElementById("root")!).render(<App />);
