import { useEffect, useState } from "react";
import { firestoreDB as supabase } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
}

export function NotificationBanner() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: notifs } = await supabase
        .from("admin_notifications")
        .select("id, title, message, type")
        .eq("is_active", true);
      if (!notifs?.length) return;

      const { data: dismissed } = await supabase
        .from("notification_dismissals")
        .select("notification_id")
        .eq("user_id", user.id);
      const dismissedIds = new Set(
        (dismissed || []).map((d) => d.notification_id),
      );
      setNotifications(
        (notifs as Notification[]).filter((n) => !dismissedIds.has(n.id)),
      );
    };
    load();
  }, [user]);

  const dismiss = async (id: string) => {
    if (user) {
      await supabase
        .from("notification_dismissals")
        .insert({ user_id: user.id, notification_id: id } as never);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!notifications.length) return null;

  const iconMap: Record<string, React.ReactNode> = {
    info: <Info className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    success: <CheckCircle className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
  };

  const colorMap: Record<string, string> = {
    info: "bg-primary/10 border-primary/20 text-primary",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600",
    success: "bg-green-500/10 border-green-500/20 text-green-600",
    error: "bg-destructive/10 border-destructive/20 text-destructive",
  };

  return (
    <div className="space-y-2 px-4 pt-3">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-start gap-3 p-3 rounded-xl border ${colorMap[n.type] || colorMap.info}`}
        >
          <div className="mt-0.5 flex-shrink-0">
            {iconMap[n.type] || iconMap.info}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{n.title}</p>
            <p className="text-xs opacity-80 mt-0.5">{n.message}</p>
          </div>
          <button
            onClick={() => dismiss(n.id)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
