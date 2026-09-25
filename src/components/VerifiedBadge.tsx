import badgeStar from "@/assets/badges/badge-star.png";
import badgeInstagram from "@/assets/badges/badge-instagram-new.png";
import badge3d from "@/assets/badges/badge-3d.png";
import badgeCloud from "@/assets/badges/badge-cloud.png";
import badgeCircle from "@/assets/badges/badge-circle.png";

export const BADGE_STYLES = [
  { id: "star", label: "Étoile", src: badgeStar },
  { id: "instagram", label: "Instagram", src: badgeInstagram },
  { id: "3d", label: "3D", src: badge3d },
  { id: "cloud", label: "Nuage", src: badgeCloud },
  { id: "circle", label: "Cercle", src: badgeCircle },
] as const;

export type BadgeStyleId = (typeof BADGE_STYLES)[number]["id"];

interface Props {
  style?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-7 h-7" };

export function VerifiedBadge({
  style = "star",
  size = "sm",
  className = "",
}: Props) {
  const badge = BADGE_STYLES.find((b) => b.id === style) || BADGE_STYLES[0];
  return (
    <img
      src={badge.src}
      alt="Vérifié"
      title="Profil vérifié"
      className={`${sizeMap[size]} object-contain flex-shrink-0 ${className}`}
      draggable={false}
    />
  );
}
