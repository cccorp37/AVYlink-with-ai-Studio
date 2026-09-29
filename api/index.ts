import type { IncomingMessage, ServerResponse } from "http";
import { app, startServer } from "../server";

let readyPromise: Promise<void> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!readyPromise) {
    readyPromise = startServer({ listen: false });
  }
  await readyPromise;
  return (app as any)(req, res);
}
