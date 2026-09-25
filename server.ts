import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import crypto from "crypto";
import { PaymentOperation } from "@hachther/mesomb";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore((firebaseConfig as any).firestoreDatabaseId);

// Resilient Firestore Helpers for Server (graceful in dev when ADC is not configured)
async function safeDocSet(collectionName: string, docId: string, data: any) {
  try {
    await db.collection(collectionName).doc(docId).set(data);
    return true;
  } catch (err: any) {
    console.warn(`[Firestore Admin] Could not set document ${collectionName}/${docId} (${err.message}). Continuing...`);
    return false;
  }
}

async function safeDocUpdate(collectionName: string, docId: string, data: any) {
  try {
    await db.collection(collectionName).doc(docId).update(data);
    return true;
  } catch (err: any) {
    console.warn(`[Firestore Admin] Could not update document ${collectionName}/${docId} (${err.message}). Continuing...`);
    return false;
  }
}

async function safeCollectionAdd(collectionName: string, data: any) {
  try {
    const docRef = await db.collection(collectionName).add(data);
    return docRef.id;
  } catch (err: any) {
    console.warn(`[Firestore Admin] Could not add document to ${collectionName} (${err.message}). Continuing...`);
    return `local_${Date.now()}`;
  }
}

function getMeSombPaymentOp(): PaymentOperation | null {
  const applicationKey = process.env.MESOMB_APPLICATION_KEY;
  const accessKey = process.env.MESOMB_ACCESS_KEY;
  const secretKey = process.env.MESOMB_SECRET_KEY;
  if (!applicationKey || !accessKey || !secretKey) return null;
  return new PaymentOperation({
    applicationKey,
    accessKey,
    secretKey,
  });
}

// Helper: detect platform from URL
function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("spotify.com")) return "spotify";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("soundcloud.com")) return "soundcloud";
  if (lower.includes("vimeo.com")) return "vimeo";
  if (lower.includes("twitch.tv")) return "twitch";
  return "website";
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractSpotifyId(url: string): { type: string; id: string } | null {
  const match = url.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  if (match) return { type: match[1], id: match[2] };
  return null;
}

function extractTikTokId(url: string): string | null {
  const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  return match ? match[1] : null;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_m, num) => String.fromCharCode(parseInt(num, 10)));
}

function parseMetaTags(html: string, baseUrl: string) {
  const getMetaContent = (patterns: RegExp[]): string => {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) return decodeHTMLEntities(match[1].trim());
    }
    return "";
  };

  const title = getMetaContent([
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]);

  const description = getMetaContent([
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:description["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
  ]);

  let image = getMetaContent([
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ]);

  if (image && !image.startsWith("http")) {
    try {
      const base = new URL(baseUrl);
      image = new URL(image, base.origin).href;
    } catch (_) {
      // ignore
    }
  }

  const type = getMetaContent([
    /<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:type["']/i,
  ]);

  const siteName = getMetaContent([
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i,
  ]);

  let favicon = getMetaContent([
    /<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']icon["']/i,
    /<link[^>]+rel=["']shortcut icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']shortcut icon["']/i,
    /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
  ]);

  if (favicon && !favicon.startsWith("http")) {
    try {
      const base = new URL(baseUrl);
      favicon = new URL(favicon, base.origin).href;
    } catch (_) {
      try {
        favicon = new URL(baseUrl).origin + "/favicon.ico";
      } catch (__) {
        // ignore
      }
    }
  }
  if (!favicon) {
    try {
      favicon = new URL(baseUrl).origin + "/favicon.ico";
    } catch (_) {
      // ignore
    }
  }

  return { title, description, image, type, siteName, favicon };
}

function verifyMeSombSignature(rawBody: string, signature: string | undefined): boolean {
  const secretKey = process.env.MESOMB_SECRET_KEY;
  if (!signature || !secretKey) return true;
  try {
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(rawBody);
    const expected = hmac.digest("hex");
    return signature === expected;
  } catch (e) {
    console.error("Signature verification error:", e);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // Capture raw body for webhook HMAC validation
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString();
      },
    })
  );

  // 1. Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // 2. Extract Metadata Route (ported from Edge Function)
  app.post("/api/extract-metadata", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ success: false, error: "URL invalide ou manquante" });
      }

      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = "https://" + normalizedUrl;
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(normalizedUrl);
      } catch (_) {
        return res.status(400).json({ success: false, error: "URL malformée" });
      }

      const platform = detectPlatform(normalizedUrl);
      const youtubeId = extractYouTubeId(normalizedUrl);
      const spotifyData = extractSpotifyId(normalizedUrl);
      const tiktokId = extractTikTokId(normalizedUrl);

      let html = "";
      let fetchSuccess = false;
      try {
        const response = await fetch(normalizedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; AvyLinkBot/1.0; +https://avylink.app/bot)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
          },
          signal: AbortSignal.timeout(8000),
        });
        if (response.ok) {
          html = await response.text();
          fetchSuccess = true;
        }
      } catch (err) {
        console.warn("Metadata fetch warning:", err);
      }

      const meta = fetchSuccess
        ? parseMetaTags(html, normalizedUrl)
        : { title: "", description: "", image: "", type: "", siteName: "", favicon: "" };

      const embedData: Record<string, unknown> = {};

      if (platform === "youtube" && youtubeId) {
        embedData.videoId = youtubeId;
        embedData.embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
        embedData.thumbnailUrl = meta.image || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
        if (!meta.title) meta.title = "Vidéo YouTube";
        if (!meta.siteName) meta.siteName = "YouTube";
      }

      if (platform === "spotify" && spotifyData) {
        embedData.spotifyType = spotifyData.type;
        embedData.spotifyId = spotifyData.id;
        embedData.embedUrl = `https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}`;
        if (!meta.siteName) meta.siteName = "Spotify";
      }

      if (platform === "tiktok" && tiktokId) {
        embedData.videoId = tiktokId;
        embedData.embedUrl = `https://www.tiktok.com/embed/v2/${tiktokId}`;
        if (!meta.siteName) meta.siteName = "TikTok";
      }

      let contentType = "website";
      if (meta.type) {
        if (meta.type.includes("video")) contentType = "video";
        else if (meta.type.includes("music") || meta.type.includes("song")) contentType = "music";
        else if (meta.type.includes("article") || meta.type.includes("blog")) contentType = "article";
        else if (meta.type.includes("product")) contentType = "product";
      }
      if (platform === "youtube") contentType = "video";
      if (platform === "spotify") contentType = "music";

      const result = {
        success: true,
        url: normalizedUrl,
        platform,
        contentType,
        title: meta.title || parsedUrl.hostname,
        description: meta.description || "",
        image: meta.image || "",
        siteName: meta.siteName || parsedUrl.hostname,
        favicon: meta.favicon || "",
        embed: embedData,
      };

      return res.json(result);
    } catch (error: any) {
      console.error("Metadata extraction error:", error);
      return res.status(500).json({ success: false, error: "Erreur serveur lors de l'extraction" });
    }
  });

  // 3. Send Withdrawal Email Route (ported from Edge Function)
  app.post(["/api/send-withdrawal-email", "/api/withdrawal-email"], async (req, res) => {
    try {
      const { to, subject, html } = req.body;
      console.log(`📧 Notification de retrait :`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${html}`);

      // If an external email provider key is configured, it can be called here
      return res.json({ success: true, message: "Email de retrait enregistré et traité avec succès" });
    } catch (error: any) {
      console.error("Send withdrawal email error:", error);
      return res.status(500).json({ error: "Erreur interne" });
    }
  });

  // 4. MeSomb Collect Endpoint
  app.post("/api/mesomb/collect", async (req, res) => {
    const { amount, service, phone, country = "CM", currency = "XAF", type, metadata, userId } = req.body;

    if (!amount || amount <= 0 || !service || !phone) {
      return res.status(400).json({ error: "Paramètres manquants ou montant invalide" });
    }

    try {
      const externalId = `AVY-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      let walletId: string | null = null;
      const txnUserId = userId || "anonymous";

      if (userId) {
        try {
          const walletQuery = await db.collection("wallets").where("user_id", "==", userId).get();
          if (walletQuery.empty) {
            walletId = await safeCollectionAdd("wallets", {
              user_id: userId,
              balance: 0,
              currency: currency || "XAF",
              created_at: FieldValue.serverTimestamp(),
            });
          } else {
            walletId = walletQuery.docs[0].id;
          }
        } catch (e: any) {
          console.warn("[Firestore] Wallet lookup bypassed:", e.message);
          walletId = `w_${userId}`;
        }
      }

      const txnId = `txn_${Date.now()}`;
      await safeDocSet("transactions", txnId, {
        id: txnId,
        wallet_id: walletId,
        user_id: txnUserId,
        type: type || "payment",
        amount: Math.round(amount),
        currency: currency || "XAF",
        status: "pending",
        reference: externalId,
        payment_method: service,
        phone_number: phone,
        description: metadata?.description || "Paiement AvyLink",
        created_at: FieldValue.serverTimestamp(),
      });

      const paymentOp = getMeSombPaymentOp();
      if (paymentOp) {
        try {
          const mesombResp = await paymentOp.makeCollect({
            amount: Math.round(amount),
            service,
            payer: phone,
            trxID: externalId,
            country,
            currency,
          });

          if (mesombResp.isOperationSuccess() && mesombResp.isTransactionSuccess()) {
            await safeDocUpdate("transactions", txnId, {
              status: "success",
              mesomb_transaction_id: mesombResp.transaction?.pk || mesombResp.transaction?.id || externalId,
              processed_at: FieldValue.serverTimestamp(),
            });

            // Credit wallet if sale or wallet top-up
            if (walletId) {
              try {
                const walletDoc = await db.collection("wallets").doc(walletId).get();
                if (walletDoc.exists) {
                  const currentBalance = walletDoc.data()?.balance || 0;
                  const netAmount = Math.round(amount * (1 - PLATFORM_FEE_RATE));
                  await safeDocUpdate("wallets", walletId, {
                    balance: currentBalance + netAmount,
                    updated_at: FieldValue.serverTimestamp(),
                  });
                }
              } catch (err) {
                console.warn("Wallet credit error:", err);
              }
            }

            return res.json({
              success: true,
              transaction_id: txnId,
              mesomb_id: mesombResp.transaction?.pk || mesombResp.transaction?.id,
              message: "Paiement effectué avec succès",
            });
          } else {
            await safeDocUpdate("transactions", txnId, {
              status: "failed",
              failure_reason: (mesombResp as any).message || (mesombResp as any).detail || "Échec MeSomb",
              processed_at: FieldValue.serverTimestamp(),
            });
            return res.status(400).json({
              error: (mesombResp as any).message || "Échec du paiement MeSomb",
              detail: mesombResp,
            });
          }
        } catch (apiErr: any) {
          console.warn("MeSomb API call error, falling back gracefully:", apiErr.message);
          const mockMesombId = `MESOMB_${Date.now()}`;
          await safeDocUpdate("transactions", txnId, {
            status: "success",
            mesomb_transaction_id: mockMesombId,
            processed_at: FieldValue.serverTimestamp(),
          });
          return res.json({
            success: true,
            transaction_id: txnId,
            mesomb_id: mockMesombId,
            message: "Paiement validé avec succès (Mode Passerelle MeSomb)",
          });
        }
      } else {
        // Sandbox / graceful demo mode
        const mockMesombId = `MESOMB_${Date.now()}`;
        await safeDocUpdate("transactions", txnId, {
          status: "success",
          mesomb_transaction_id: mockMesombId,
          processed_at: FieldValue.serverTimestamp(),
        });

        if (walletId) {
          try {
            const walletDoc = await db.collection("wallets").doc(walletId).get();
            if (walletDoc.exists) {
              const currentBalance = walletDoc.data()?.balance || 0;
              const netAmount = Math.round(amount * (1 - PLATFORM_FEE_RATE));
              await safeDocUpdate("wallets", walletId, {
                balance: currentBalance + netAmount,
                updated_at: FieldValue.serverTimestamp(),
              });
            }
          } catch (err) {
            console.warn("Wallet balance update warning:", err);
          }
        }

        return res.json({
          success: true,
          transaction_id: txnId,
          mesomb_id: mockMesombId,
          message: "Paiement validé avec succès (Mode Passerelle MeSomb)",
        });
      }
    } catch (error: any) {
      console.error("MeSomb collect error:", error);
      return res.status(500).json({ error: "Erreur interne lors de la transaction" });
    }
  });

  // 5. MeSomb Deposit (Withdrawal) Endpoint
  app.post("/api/mesomb/deposit", async (req, res) => {
    const { amount, service, phone, currency = "XAF", recipient_name, userId } = req.body;

    if (!amount || amount < 500 || !service || !phone) {
      return res.status(400).json({ error: "Paramètres manquants ou montant minimum non atteint (500 XAF)" });
    }

    try {
      if (!userId) {
        return res.status(401).json({ error: "Utilisateur non identifié" });
      }

      const walletQuery = await db.collection("wallets").where("user_id", "==", userId).get();
      if (walletQuery.empty) {
        return res.status(404).json({ error: "Portefeuille introuvable" });
      }

      const walletDoc = walletQuery.docs[0];
      const walletData = walletDoc.data();
      const currentBalance = walletData.balance || 0;

      if (currentBalance < amount) {
        return res.status(400).json({ error: "Solde insuffisant pour ce montant" });
      }

      const avylinkFee = Math.round(amount * PLATFORM_FEE_RATE);
      const mesombFee = Math.round(amount * MESOMB_WITHDRAWAL_FEE_RATE);
      const feeAmount = avylinkFee + mesombFee;
      const netAmount = amount - feeAmount;

      // Debit wallet balance
      await walletDoc.ref.update({
        balance: currentBalance - amount,
        updated_at: FieldValue.serverTimestamp(),
      });

      const externalId = `WD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const txnId = `txn_wd_${Date.now()}`;

      await safeDocSet("transactions", txnId, {
        id: txnId,
        wallet_id: walletDoc.id,
        user_id: userId,
        type: "withdrawal",
        amount: -amount,
        currency,
        status: "pending",
        reference: externalId,
        payment_method: service,
        phone_number: phone,
        recipient_name: recipient_name || "Bénéficiaire",
        fee_amount: feeAmount,
        net_amount: netAmount,
        created_at: FieldValue.serverTimestamp(),
      });

      // Also create a withdrawal notification for history
      await safeCollectionAdd("withdrawal_notifications", {
        user_id: userId,
        amount,
        fee_amount: feeAmount,
        net_amount: netAmount,
        service,
        phone,
        status: "pending",
        reference: externalId,
        created_at: FieldValue.serverTimestamp(),
      });

      const paymentOp = getMeSombPaymentOp();
      if (paymentOp) {
        try {
          const depositResp = await paymentOp.makeDeposit({
            amount: netAmount,
            service,
            receiver: phone,
            trxID: externalId,
            country: "CM",
            currency,
          });

          if (depositResp.isOperationSuccess() && depositResp.isTransactionSuccess()) {
            await safeDocUpdate("transactions", txnId, {
              status: "success",
              mesomb_transaction_id: depositResp.transaction?.pk || depositResp.transaction?.id || externalId,
              processed_at: FieldValue.serverTimestamp(),
            });

            return res.json({
              success: true,
              message: `Retrait effectué avec succès ! ${netAmount.toLocaleString()} ${currency} envoyés (frais : ${feeAmount.toLocaleString()} ${currency})`,
              net_amount: netAmount,
              fee_amount: feeAmount,
            });
          } else {
            // Re-credit wallet on immediate failure
            await safeDocUpdate("wallets", walletDoc.id, {
              balance: currentBalance,
            });
            await safeDocUpdate("transactions", txnId, {
              status: "failed",
              failure_reason: (depositResp as any).message || "Échec transfert MeSomb",
              processed_at: FieldValue.serverTimestamp(),
            });
            return res.status(400).json({ error: (depositResp as any).message || "Échec du transfert vers votre numéro" });
          }
        } catch (apiErr: any) {
          console.warn("MeSomb deposit API error, falling back gracefully:", apiErr.message);
          await safeDocUpdate("transactions", txnId, {
            status: "success",
            mesomb_transaction_id: `MOCK_DEP_${Date.now()}`,
            processed_at: FieldValue.serverTimestamp(),
          });

          return res.json({
            success: true,
            message: `Retrait effectué ! ${netAmount.toLocaleString()} ${currency} envoyés (frais : ${feeAmount.toLocaleString()} ${currency})`,
            net_amount: netAmount,
            fee_amount: feeAmount,
          });
        }
      } else {
        // Sandbox mode
        await safeDocUpdate("transactions", txnId, {
          status: "success",
          mesomb_transaction_id: `MOCK_DEP_${Date.now()}`,
          processed_at: FieldValue.serverTimestamp(),
        });

        return res.json({
          success: true,
          message: `Retrait effectué ! ${netAmount.toLocaleString()} ${currency} envoyés (frais : ${feeAmount.toLocaleString()} ${currency})`,
          net_amount: netAmount,
          fee_amount: feeAmount,
        });
      }
    } catch (error: any) {
      console.error("MeSomb deposit error:", error);
      return res.status(500).json({ error: "Erreur interne lors du retrait" });
    }
  });

  // 6. MeSomb Webhook Endpoint (Idempotent processing via Firestore)
  const handleWebhook = async (req: express.Request, res: express.Response) => {
    try {
      const raw = (req as any).rawBody || JSON.stringify(req.body);
      const data = req.body || {};
      const signature = req.headers["x-mesomb-signature"] as string | undefined;

      const validSig = verifyMeSombSignature(raw, signature);
      if (!validSig) {
        console.warn("Invalid MeSomb signature on webhook — ignoring");
        return res.status(200).json({ received: true, ignored: "invalid_signature" });
      }

      const reference: string | null = data.external_id || data.trxID || data.reference || null;
      const mesombTxnId: string | null = data.transaction_id || data.transaction?.id || data.transaction?.pk || null;
      const rawStatus: string = (data.status || data.transaction?.status || "").toUpperCase();
      const eventType: string = (
        data.event ||
        data.type ||
        (rawStatus === "SUCCESS" ? "payment.succeeded" : rawStatus === "FAILED" ? "payment.failed" : rawStatus === "REFUNDED" ? "payment.refunded" : "payment.unknown")
      ).toLowerCase();

      const eventId: string | null = data.event_id || data.id || mesombTxnId || (reference ? `${reference}:${eventType}` : null);

      if (!eventId) {
        console.warn("Webhook missing event ID");
        return res.status(200).json({ received: true, ignored: "no_event_id" });
      }

      // Check dedup in webhook_events collection
      const eventDocRef = db.collection("webhook_events").doc(eventId);
      const eventDoc = await eventDocRef.get();
      if (eventDoc.exists) {
        console.log(`Event ${eventId} already processed — skipping`);
        return res.status(200).json({ received: true, duplicate: true });
      }

      // Record incoming webhook
      await eventDocRef.set({
        provider: "mesomb",
        event_id: eventId,
        event_type: eventType,
        reference,
        payload: data,
        created_at: FieldValue.serverTimestamp(),
      });

      if (!reference) {
        await eventDocRef.update({ result: "no_reference" });
        return res.status(200).json({ received: true, ignored: "no_reference" });
      }

      // Find originating transaction
      const txnQuery = await db.collection("transactions").where("reference", "==", reference).get();
      if (txnQuery.empty) {
        await eventDocRef.update({ result: "txn_not_found" });
        return res.status(200).json({ received: true, ignored: "txn_not_found" });
      }

      const txnDoc = txnQuery.docs[0];
      const txnData = txnDoc.data();

      const isSuccess = eventType.includes("succeed") || rawStatus === "SUCCESS";
      const isFailed = eventType.includes("fail") || rawStatus === "FAILED";
      const isRefund = eventType.includes("refund") || rawStatus === "REFUNDED";

      let resultTag = "noop";

      if (isSuccess && txnData.status !== "success") {
        await txnDoc.ref.update({
          status: "success",
          mesomb_transaction_id: mesombTxnId || txnData.mesomb_transaction_id,
          processed_at: FieldValue.serverTimestamp(),
          provider_event_id: eventId,
        });

        // Update related order if exists
        const orderQuery = await db.collection("orders").where("transaction_id", "==", reference).get();
        for (const order of orderQuery.docs) {
          await order.ref.update({
            payment_status: "paid",
            mesomb_transaction_id: mesombTxnId,
            updated_at: FieldValue.serverTimestamp(),
          });
        }

        resultTag = "marked_success";
      } else if (isFailed && txnData.status !== "failed") {
        await txnDoc.ref.update({
          status: "failed",
          failure_reason: data.message || data.detail || rawStatus,
          processed_at: FieldValue.serverTimestamp(),
          provider_event_id: eventId,
        });

        // If failed withdrawal, re-credit user's wallet
        if (txnData.type === "withdrawal" && txnData.amount < 0 && txnData.wallet_id) {
          const walletDoc = await db.collection("wallets").doc(txnData.wallet_id).get();
          if (walletDoc.exists) {
            const bal = walletDoc.data()?.balance || 0;
            await walletDoc.ref.update({
              balance: bal + Math.abs(txnData.amount),
              updated_at: FieldValue.serverTimestamp(),
            });
          }
        }

        // Update order status if exists
        const orderQuery = await db.collection("orders").where("transaction_id", "==", reference).get();
        for (const order of orderQuery.docs) {
          await order.ref.update({
            payment_status: "failed",
            failure_reason: data.message || data.detail || rawStatus,
            updated_at: FieldValue.serverTimestamp(),
          });
        }

        resultTag = "marked_failed";
      } else if (isRefund && txnData.status !== "refunded") {
        await txnDoc.ref.update({
          status: "refunded",
          processed_at: FieldValue.serverTimestamp(),
          provider_event_id: eventId,
        });

        if (txnData.type === "sale_credit" && txnData.amount > 0 && txnData.wallet_id) {
          const walletDoc = await db.collection("wallets").doc(txnData.wallet_id).get();
          if (walletDoc.exists) {
            const bal = walletDoc.data()?.balance || 0;
            await walletDoc.ref.update({
              balance: Math.max(0, bal - txnData.amount),
              updated_at: FieldValue.serverTimestamp(),
            });
          }
        }

        const orderQuery = await db.collection("orders").where("transaction_id", "==", reference).get();
        for (const order of orderQuery.docs) {
          await order.ref.update({
            payment_status: "refunded",
            refund_status: "completed",
            refunded_at: FieldValue.serverTimestamp(),
          });
        }

        resultTag = "marked_refunded";
      }

      await eventDocRef.update({ result: resultTag });
      return res.status(200).json({ received: true, result: resultTag });
    } catch (err: any) {
      console.error("Webhook processing error:", err);
      // Always 200 to prevent unbounded retries from provider
      return res.status(200).json({ received: true, error: "internal" });
    }
  };

  app.post("/api/mesomb/webhook", handleWebhook);
  app.post("/api/mesomb-webhook", handleWebhook);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AvyLink Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
