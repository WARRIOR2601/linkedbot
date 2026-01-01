import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Activity, AlertTriangle } from "lucide-react";

const stats = [
  { title: "Total Users", value: "12,456", icon: Users, change: "+234 this week" },
  { title: "Active Subscriptions", value: "8,923", icon: CreditCard, change: "72% of users" },
  { title: "System Health", value: "99.9%", icon: Activity, change: "Uptime" },
  { title: "Open Issues", value: "3", icon: AlertTriangle, change: "2 critical" },
];

const AdminDashboard = () => (
  <AdminLayout>
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                <s.icon className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default AdminDashboard;
