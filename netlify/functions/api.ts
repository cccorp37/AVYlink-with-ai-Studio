import { IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";
import { app, startServer } from "../../server";

let readyPromise: Promise<void> | null = null;

interface NetlifyEvent {
  path: string;
  httpMethod: string;
  headers?: Record<string, string | undefined>;
  multiValueHeaders?: Record<string, string[] | undefined>;
  queryStringParameters?: Record<string, string | undefined> | null;
  rawQuery?: string;
  body?: string | null;
  isBase64Encoded?: boolean;
}

export const handler = async (event: NetlifyEvent, _context: unknown) => {
  if (!readyPromise) {
    readyPromise = startServer({ listen: false });
  }
  await readyPromise;

  return new Promise<{
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    isBase64Encoded?: boolean;
  }>((resolve, reject) => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);

    req.method = event.httpMethod || "GET";

    // Normalize path so Express routes under /api/* always match
    let normalizedPath = event.path || "/";
    if (normalizedPath.startsWith("/.netlify/functions/api")) {
      normalizedPath = normalizedPath.replace("/.netlify/functions/api", "/api");
    }
    if (!normalizedPath.startsWith("/api")) {
      normalizedPath = `/api${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
    }

    const queryString =
      event.rawQuery ||
      (event.queryStringParameters
        ? new URLSearchParams(
            Object.entries(event.queryStringParameters).reduce(
              (acc, [k, v]) => {
                if (v !== undefined) acc[k] = v;
                return acc;
              },
              {} as Record<string, string>,
            ),
          ).toString()
        : "");

    req.url = queryString ? `${normalizedPath}?${queryString}` : normalizedPath;
    (req as any).originalUrl = req.url;

    // Normalize headers to lowercase
    const headers: Record<string, string> = {};
    if (event.headers) {
      for (const [key, val] of Object.entries(event.headers)) {
        if (val !== undefined) {
          headers[key.toLowerCase()] = val;
        }
      }
    }

    let bodyBuffer: Buffer | null = null;
    if (event.body) {
      bodyBuffer = Buffer.from(
        event.body,
        event.isBase64Encoded ? "base64" : "utf8",
      );
      headers["content-length"] = String(bodyBuffer.length);
      (req as any).rawBody = bodyBuffer.toString("utf8");
    }

    req.headers = headers;

    const res = new ServerResponse(req);
    const responseChunks: Buffer[] = [];
    const responseHeaders: Record<string, string> = {
      "access-control-allow-origin": "*",
    };

    const origSetHeader = res.setHeader.bind(res);
    res.setHeader = (name: string, value: number | string | readonly string[]) => {
      responseHeaders[name.toLowerCase()] = Array.isArray(value)
        ? value.join(", ")
        : String(value);
      return origSetHeader(name, value);
    };

    const origWriteHead = res.writeHead.bind(res);
    res.writeHead = ((
      statusCode: number,
      statusMessage?: any,
      headersArg?: any,
    ) => {
      res.statusCode = statusCode;
      const hdrs =
        typeof statusMessage === "object" ? statusMessage : headersArg;
      if (hdrs && typeof hdrs === "object") {
        for (const [k, v] of Object.entries(hdrs)) {
          if (v !== undefined) {
            responseHeaders[k.toLowerCase()] = Array.isArray(v)
              ? v.join(", ")
              : String(v);
          }
        }
      }
      return origWriteHead(statusCode, statusMessage, headersArg);
    }) as any;

    res.write = ((chunk: any, encoding?: any, cb?: any) => {
      if (chunk) {
        responseChunks.push(
          Buffer.isBuffer(chunk)
            ? chunk
            : Buffer.from(
                String(chunk),
                typeof encoding === "string" ? (encoding as BufferEncoding) : "utf8",
              ),
        );
      }
      if (typeof encoding === "function") encoding();
      else if (typeof cb === "function") cb();
      return true;
    }) as any;

    res.end = ((chunk?: any, encoding?: any, cb?: any) => {
      if (chunk && typeof chunk !== "function") {
        responseChunks.push(
          Buffer.isBuffer(chunk)
            ? chunk
            : Buffer.from(
                String(chunk),
                typeof encoding === "string" ? (encoding as BufferEncoding) : "utf8",
              ),
        );
      }
      if (typeof chunk === "function") chunk();
      else if (typeof encoding === "function") encoding();
      else if (typeof cb === "function") cb();

      const fullBody = Buffer.concat(responseChunks).toString("utf8");
      resolve({
        statusCode: res.statusCode || 200,
        headers: responseHeaders,
        body: fullBody,
      });
      return res;
    }) as any;

    res.on("error", (err) => {
      reject(err);
    });

    // Dispatch request to Express and stream body
    (app as any)(req, res);

    process.nextTick(() => {
      if (bodyBuffer) {
        req.push(bodyBuffer);
      }
      req.push(null);
    });
  });
};
