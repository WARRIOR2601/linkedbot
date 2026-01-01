import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Linkedin, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Business Info", description: "Tell us about your business" },
  { id: 2, title: "Target Audience", description: "Who are you trying to reach?" },
  { id: 3, title: "Content Goals", description: "What do you want to achieve?" },
];

const goalOptions = [
  "Build personal brand",
  "Generate leads",
  "Share expertise",
  "Network growth",
  "Thought leadership",
  "Career opportunities",
];

const toneOptions = [
  "Professional",
  "Conversational",
  "Inspirational",
  "Educational",
  "Humorous",
  "Authoritative",
];

const frequencyOptions = [
  "1-2 times per week",
  "3-4 times per week",
  "Daily",
  "Multiple times per day",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completeOnboarding, isLoading: profileLoading, isComplete } = useOnboarding();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [toneOfVoice, setToneOfVoice] = useState("");
  const [postingFrequency, setPostingFrequency] = useState("");

  const progress = (currentStep / steps.length) * 100;

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    const { error } = await completeOnboarding({
      business_name: businessName,
      industry,
      description,
      target_audience: targetAudience,
      goals: selectedGoals,
      tone_of_voice: toneOfVoice,
      posting_frequency: postingFrequency,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error saving profile",
        description: error,
      });
      return;
    }

    toast({
      title: "Profile complete!",
      description: "Welcome to Linkedbot. Let's create some amazing content.",
    });

    navigate("/app/dashboard");
  };

  // If already complete, this will be handled by ProtectedRoute
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
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
                  {step.id < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.id}
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
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business / Brand Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Your company or personal brand name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology, Marketing, Finance"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe what you do and what makes you unique..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    placeholder="Describe your ideal audience (e.g., CTOs at B2B SaaS companies, HR professionals in healthcare, etc.)"
                    rows={4}
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Tone of Voice</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {toneOptions.map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setToneOfVoice(tone)}
                        className={`p-3 rounded-lg border text-sm text-left transition-all ${
                          toneOfVoice === tone
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>What are your main goals? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {goalOptions.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`p-3 rounded-lg border text-sm text-left transition-all ${
                          selectedGoals.includes(goal)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Posting Frequency</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {frequencyOptions.map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setPostingFrequency(freq)}
                        className={`p-3 rounded-lg border text-sm text-left transition-all ${
                          postingFrequency === freq
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
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
                <Button variant="hero" onClick={handleComplete} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Complete Setup
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
