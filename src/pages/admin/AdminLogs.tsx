import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

const logs = [
  { type: "error", message: "Failed to connect to LinkedIn API", time: "2 min ago" },
  { type: "warning", message: "High memory usage detected", time: "15 min ago" },
  { type: "info", message: "Scheduled maintenance completed", time: "1 hour ago" },
  { type: "success", message: "Database backup completed", time: "2 hours ago" },
];

const AdminLogs = () => (
  <AdminLayout>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Logs</h1>
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {logs.map((log, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              {log.type === "error" && <AlertTriangle className="w-5 h-5 text-destructive" />}
              {log.type === "warning" && <AlertTriangle className="w-5 h-5 text-warning" />}
              {log.type === "info" && <Info className="w-5 h-5 text-primary" />}
              {log.type === "success" && <CheckCircle2 className="w-5 h-5 text-success" />}
              <div className="flex-1"><p className="font-medium">{log.message}</p><p className="text-sm text-muted-foreground">{log.time}</p></div>
              <Badge variant={log.type === "error" ? "destructive" : "secondary"}>{log.type}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
);

export default AdminLogs;
