import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CreditCard, Zap } from "lucide-react";

const plans = [
  { name: "Free", price: "$0", features: ["3 AI posts/month", "Basic analytics"], current: false },
  { name: "Pro", price: "$29", features: ["Unlimited posts", "Advanced analytics", "Content calendar", "Priority support"], current: true },
  { name: "Business", price: "$99", features: ["Everything in Pro", "5 LinkedIn accounts", "Team collaboration", "API access"], current: false },
];

const Billing = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription</p>
        </div>

        <Card className="border-primary/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Pro Plan</p>
                  <p className="text-sm text-muted-foreground">$29/month • Renews Jan 15, 2024</p>
                </div>
              </div>
              <Button variant="outline">Manage Subscription</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.current ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-2xl font-bold">{plan.price}<span className="text-sm text-muted-foreground">/mo</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-success" />{f}</li>
                  ))}
                </ul>
                <Button variant={plan.current ? "secondary" : "outline"} className="w-full" disabled={plan.current}>
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Billing;
