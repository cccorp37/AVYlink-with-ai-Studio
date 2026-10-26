import type { IncomingMessage, ServerResponse } from "http";
import { app, startServer } from "../server";

let readyPromise: Promise<void> | null = null;

export default async function handler(
  req: IncomingMessage & { url?: string; originalUrl?: string },
  res: ServerResponse,
) {
  if (!readyPromise) {
    readyPromise = startServer({ listen: false });
  }
  await readyPromise;

  // Ensure URL always retains the /api prefix when routed via Vercel rewrites
  if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }

  return (app as any)(req, res);
}
