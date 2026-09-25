import { useEffect, useState } from "react";
import { firestoreDB as supabase } from "@/lib/db";
import { useAdmin } from "@/hooks/useAdmin";
import { Wrench } from "lucide-react";

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdmin();
  const [maintenance, setMaintenance] = useState<{
    enabled: boolean;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .single()
      .then(({ data }) => {
        if (data) {
          setMaintenance(data.value as { enabled: boolean; message: string });
        }
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  if (maintenance?.enabled && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="font-dm font-bold text-2xl text-foreground mb-3">
            Maintenance en cours
          </h1>
          <p className="text-muted-foreground">{maintenance.message}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
