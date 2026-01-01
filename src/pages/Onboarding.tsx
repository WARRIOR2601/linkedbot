import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Linkedin, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

const steps = [
  { id: 1, title: "Personal Info", description: "Tell us about yourself" },
  { id: 2, title: "Business Details", description: "Your professional background" },
  { id: 3, title: "Content Goals", description: "What do you want to achieve?" },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Linkedin className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-gradient">Linkedbot</span>
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${
                  step.id <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep
                      ? "bg-success text-success-foreground"
                      : step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="hidden sm:block text-sm">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headline">LinkedIn Headline</Label>
                  <Input
                    id="headline"
                    placeholder="e.g., Marketing Director | Growth Expert"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="San Francisco, CA" />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Your company name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="Your current role" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" placeholder="e.g., Technology, Marketing" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Short Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about your professional background..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>What are your main goals?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Build personal brand",
                      "Generate leads",
                      "Share expertise",
                      "Network growth",
                      "Thought leadership",
                      "Career opportunities",
                    ].map((goal) => (
                      <button
                        key={goal}
                        className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-sm text-left transition-all"
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topics">Content Topics (comma separated)</Label>
                  <Input
                    id="topics"
                    placeholder="e.g., AI, Marketing, Leadership"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Posting Frequency</Label>
                  <select className="w-full h-11 rounded-lg border border-border bg-secondary/50 px-4 text-sm">
                    <option>1-2 times per week</option>
                    <option>3-4 times per week</option>
                    <option>Daily</option>
                    <option>Multiple times per day</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < 3 ? (
                <Button
                  variant="hero"
                  onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button variant="hero" asChild>
                  <Link to="/app/dashboard">
                    Complete Setup
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
