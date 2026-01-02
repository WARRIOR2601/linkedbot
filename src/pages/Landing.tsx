import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Calendar,
  BarChart3,
  Zap,
  Target,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Content Assistants",
    description: "Train AI agents to draft posts in your voice. You review and approve everything before publishing.",
  },
  {
    icon: Calendar,
    title: "User-Controlled Scheduling",
    description: "Schedule posts at times you choose. Pause or cancel anytime—you're always in control.",
  },
  {
    icon: BarChart3,
    title: "Performance Insights",
    description: "Track your content performance and understand what resonates with your audience.",
  },
  {
    icon: Target,
    title: "Professional Content Support",
    description: "AI agents help craft content that speaks to your ideal LinkedIn audience.",
  },
];

const steps = [
  {
    number: "01",
    title: "Connect LinkedIn",
    description: "Securely link your LinkedIn profile with your consent.",
  },
  {
    number: "02",
    title: "Train Your Agent",
    description: "Create an AI assistant that drafts posts in your voice and style.",
  },
  {
    number: "03",
    title: "Review & Publish",
    description: "Approve every post before it goes live. You're always in control.",
  },
];

const postTypes = [
  { label: "Thought Leadership", color: "from-primary to-accent" },
  { label: "Industry Insights", color: "from-accent to-primary" },
  { label: "Success Stories", color: "from-success to-primary" },
  { label: "How-To Guides", color: "from-warning to-accent" },
  { label: "Engagement Posts", color: "from-primary to-success" },
  { label: "Personal Branding", color: "from-accent to-warning" },
];

const Landing = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered LinkedIn Content</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Grow Your LinkedIn
              <br />
              <span className="text-gradient">With Smart Content</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              AI assistants that draft content based on your voice and rules. 
              You review and approve every post—always in control of your personal brand.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to
              <span className="text-gradient"> Succeed on LinkedIn</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our suite of AI tools helps you create, schedule, and analyze your LinkedIn content like a pro.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-muted/50 to-transparent">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Growing in
              <span className="text-gradient"> 3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Post Types */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI That Writes
              <span className="text-gradient"> Any Post Type</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From thought leadership to engagement hooks, our AI adapts to your content goals.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {postTypes.map((type, index) => (
              <div
                key={index}
                className={`px-6 py-3 rounded-full bg-gradient-to-r ${type.color} text-primary-foreground font-medium text-sm hover:scale-105 transition-transform cursor-pointer`}
              >
                {type.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              A Dashboard That
              <span className="text-gradient"> Works For You</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need in one beautiful, intuitive interface.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden border-primary/20">
              <div className="aspect-video bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 p-8 w-full max-w-3xl">
                  <Card className="col-span-2 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="font-medium">Engagement Overview</span>
                    </div>
                    <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg animate-pulse" />
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-5 h-5 text-accent" />
                      <span className="font-medium">Scheduled</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded animate-pulse" />
                      <div className="h-8 bg-muted rounded animate-pulse" />
                      <div className="h-8 bg-muted rounded animate-pulse" />
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-3xl font-bold text-primary">2.5K</div>
                    <div className="text-sm text-muted-foreground">Profile Views</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-3xl font-bold text-success">+45%</div>
                    <div className="text-sm text-muted-foreground">Engagement Rate</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-3xl font-bold text-accent">128</div>
                    <div className="text-sm text-muted-foreground">Posts This Month</div>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <Card className="relative overflow-hidden border-primary/30">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
            <CardContent className="relative z-10 p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your LinkedIn?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of professionals who are growing their personal brand with Linkedbot.
              </p>
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Landing;
