import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const subs = [
  { plan: "Free", users: 3533, revenue: "$0" },
  { plan: "Pro", users: 7234, revenue: "$209,786" },
  { plan: "Business", users: 1689, revenue: "$167,211" },
];

const AdminSubscriptions = () => (
  <AdminLayout>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Subscription Management</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {subs.map((s) => (
          <Card key={s.plan}>
            <CardContent className="p-6 text-center">
              <Badge className="mb-4">{s.plan}</Badge>
              <p className="text-3xl font-bold">{s.users.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mb-2">Active Users</p>
              <p className="text-lg font-semibold text-success">{s.revenue}</p>
              <p className="text-xs text-muted-foreground">Monthly Revenue</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default AdminSubscriptions;
