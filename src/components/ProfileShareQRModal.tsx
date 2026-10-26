import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Copy,
  Check,
  Download,
  Share2,
  UserPlus,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileShareQRModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  website?: string | null;
  accentColor?: string;
}

const QR_COLORS = [
  { id: "navy", label: "Marine", fg: "#0f172a", bg: "#ffffff" },
  { id: "blue", label: "AvyLink", fg: "#0284c7", bg: "#f0f9ff" },
  { id: "emerald", label: "Émeraude", fg: "#065f46", bg: "#ecfdf5" },
  { id: "violet", label: "Violet", fg: "#5b21b6", bg: "#f5f3ff" },
  { id: "rose", label: "Rose", fg: "#9d174d", bg: "#fdf2f8" },
];

export function downloadVCard({
  displayName,
  username,
  bio,
  website,
  profileUrl,
}: {
  displayName: string;
  username: string;
  bio?: string | null;
  website?: string | null;
  profileUrl: string;
}) {
  const cleanName = displayName || username;
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${cleanName}`,
    `N:${cleanName};;;;`,
    `NICKNAME:@${username}`,
    `URL:${profileUrl}`,
    website ? `URL;TYPE=WORK:${website}` : "",
    bio ? `NOTE:${bio.replace(/\r?\n/g, " ")}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${username || "contact"}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ProfileShareQRModal({
  open,
  onClose,
  username,
  displayName,
  bio,
  website,
}: ProfileShareQRModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [selectedColor, setSelectedColor] = useState(QR_COLORS[0]);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const profileUrl = `${window.location.origin}/u/${username}`;
  const fgHex = selectedColor.fg.replace("#", "");
  const bgHex = selectedColor.bg.replace("#", "");
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    profileUrl,
  )}&color=${fgHex}&bgcolor=${bgHex}&margin=12&format=png`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({ title: "✅ Lien copié dans le presse-papier !" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName || username} — AvyLink`,
          text: bio || `Découvre la page AvyLink de ${displayName || username}`,
          url: profileUrl,
        });
      } catch {
        /* cancelled */
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadQRCard = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background
      ctx.fillStyle = selectedColor.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Decorative border
      ctx.strokeStyle = selectedColor.fg + "22";
      ctx.lineWidth = 6;
      ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

      // Header Name
      ctx.fillStyle = selectedColor.fg;
      ctx.font = "bold 44px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(displayName || `@${username}`, canvas.width / 2, 130);

      // Handle
      ctx.fillStyle = selectedColor.fg + "aa";
      ctx.font = "500 26px 'Inter', sans-serif";
      ctx.fillText(`@${username}`, canvas.width / 2, 175);

      // Load QR image
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("QR load error"));
        img.src = qrImageUrl;
      });

      // White/tinted rounded box for QR
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(170, 230, 460, 460);
      ctx.drawImage(img, 190, 250, 420, 420);

      // Footer instructions
      ctx.fillStyle = selectedColor.fg;
      ctx.font = "bold 28px 'DM Sans', sans-serif";
      ctx.fillText("Scannez pour accéder à mon univers", canvas.width / 2, 770);

      ctx.fillStyle = selectedColor.fg + "99";
      ctx.font = "500 22px 'Inter', sans-serif";
      ctx.fillText(profileUrl.replace(/^https?:\/\//, ""), canvas.width / 2, 815);

      ctx.font = "bold 20px 'DM Sans', sans-serif";
      ctx.fillText("Propulsé par AvyLink", canvas.width / 2, 910);

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `avylink-qr-${username}.png`;
      a.click();
      toast({ title: "✅ Carte QR téléchargée !" });
    } catch {
      window.open(qrImageUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="font-dm font-bold text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Partager & QR Code Studio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Preview Card */}
          <div
            ref={cardRef}
            className="rounded-2xl p-6 text-center border border-border/60 shadow-inner transition-colors"
            style={{ backgroundColor: selectedColor.bg }}
          >
            <p
              className="font-dm font-bold text-lg truncate"
              style={{ color: selectedColor.fg }}
            >
              {displayName || `@${username}`}
            </p>
            <p
              className="text-xs font-medium mb-4"
              style={{ color: `${selectedColor.fg}99` }}
            >
              @{username}
            </p>
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-md border border-black/5 flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt={`QR Code @${username}`}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <p
              className="text-[11px] font-medium mt-3"
              style={{ color: `${selectedColor.fg}bb` }}
            >
              Scannez avec l'appareil photo pour ouvrir la page
            </p>
          </div>

          {/* Color Picker */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Style du QR :
            </span>
            <div className="flex items-center gap-2">
              {QR_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c)}
                  title={c.label}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    selectedColor.id === c.id
                      ? "scale-125 border-primary shadow-sm"
                      : "border-transparent hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.fg }}
                />
              ))}
            </div>
          </div>

          {/* Copy Link Bar */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary/50 border border-border/60">
            <span className="text-xs font-mono text-foreground truncate flex-1 px-2">
              {profileUrl}
            </span>
            <Button
              size="sm"
              onClick={handleCopy}
              className="rounded-lg h-8 px-3 text-xs font-semibold gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copié
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copier
                </>
              )}
            </Button>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              onClick={handleDownloadQRCard}
              disabled={downloading}
              className="rounded-xl text-xs font-semibold gap-1.5 h-10"
            >
              <Download className="w-4 h-4 text-primary" />
              {downloading ? "Génération..." : "Télécharger PNG"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                downloadVCard({
                  displayName: displayName || username,
                  username,
                  bio,
                  website,
                  profileUrl,
                });
                toast({ title: "📇 Fiche contact vCard téléchargée !" });
              }}
              className="rounded-xl text-xs font-semibold gap-1.5 h-10"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              Fiche Contact (.vcf)
            </Button>
          </div>

          {/* Share & Open */}
          <div className="flex gap-2">
            <Button
              onClick={handleNativeShare}
              className="flex-1 gradient-cta text-primary-foreground rounded-xl text-xs font-bold gap-2 h-10"
            >
              <Share2 className="w-4 h-4" />
              Partager ma page
            </Button>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-3.5 rounded-xl border border-border hover:bg-secondary text-foreground transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
