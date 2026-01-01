import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal } from "lucide-react";

const users = [
  { name: "John Doe", email: "john@example.com", plan: "Pro", status: "active", posts: 45 },
  { name: "Jane Smith", email: "jane@example.com", plan: "Business", status: "active", posts: 128 },
  { name: "Bob Wilson", email: "bob@example.com", plan: "Free", status: "inactive", posts: 3 },
];

const AdminUsers = () => (
  <AdminLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search users..." className="pl-10" /></div>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Plan</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Posts</th>
              <th className="p-4"></th>
            </tr></thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="p-4"><p className="font-medium">{u.name}</p><p className="text-sm text-muted-foreground">{u.email}</p></td>
                  <td className="p-4"><Badge variant="secondary">{u.plan}</Badge></td>
                  <td className="p-4"><Badge variant={u.status === "active" ? "default" : "outline"}>{u.status}</Badge></td>
                  <td className="p-4">{u.posts}</td>
                  <td className="p-4"><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
);

export default AdminUsers;
