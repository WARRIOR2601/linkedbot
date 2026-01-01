import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Cpu } from "lucide-react";

const models = [
  { name: "GPT-4 Turbo", provider: "OpenAI", status: true, usage: "45%" },
  { name: "Claude 3", provider: "Anthropic", status: true, usage: "32%" },
  { name: "Gemini Pro", provider: "Google", status: false, usage: "0%" },
];

const AdminAIModels = () => (
  <AdminLayout>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI Model Management</h1>
      <div className="grid gap-4">
        {models.map((m) => (
          <Card key={m.name}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Cpu className="w-5 h-5 text-primary" /></div>
                <div><p className="font-semibold">{m.name}</p><p className="text-sm text-muted-foreground">{m.provider}</p></div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-muted-foreground">Usage: {m.usage}</span>
                <Switch defaultChecked={m.status} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default AdminAIModels;
