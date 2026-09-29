import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-medium text-white shadow-xl animate-fade-in">
      <WifiOff className="w-4 h-4 animate-pulse flex-shrink-0" />
      <span>Mode hors ligne actif — Consultation locale des données disponibles.</span>
    </div>
  );
};
