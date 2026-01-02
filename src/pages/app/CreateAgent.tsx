import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAgents, AGENT_TYPES, POSTING_FREQUENCIES, WEEKDAYS, IMAGE_STYLES, CreateAgentInput } from "@/hooks/useAgents";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Bot,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  MessageSquare,
  Tags,
  User,
  Building2,
  FileText,
  ImageIcon,
  Eye,
  Check,
  RefreshCw,
  Loader2,
} from "lucide-react";

const TOTAL_STEPS = 7;

const CreateAgent = () => {
  const navigate = useNavigate();
  const { createAgent, agents } = useAgents();
  const { subscription, canCreateAgent, isLoading: subLoading } = useSubscription();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreateAgentInput>({
    name: "",
    agent_type: "professional",
    posting_goal: "",
    tone_of_voice: "",
    topics: [],
    posting_frequency: "weekdays",
    preferred_posting_days: [1, 2, 3, 4, 5],
    preferred_time_window_start: "09:00",
    preferred_time_window_end: "17:00",
    about_user: "",
    about_company: "",
    target_audience: "",
    sample_posts: [],
    auto_generate_images: true,
    allow_text_only_posts: true,
    preferred_image_style: "professional",
  });

  const [topicInput, setTopicInput] = useState("");
  const [samplePostInput, setSamplePostInput] = useState("");
  const [previewPosts, setPreviewPosts] = useState<string[]>([]);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);

  const handleAddTopic = () => {
    if (topicInput.trim() && formData.topics && formData.topics.length < 10) {
      setFormData({
        ...formData,
        topics: [...(formData.topics || []), topicInput.trim()],
      });
      setTopicInput("");
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setFormData({
      ...formData,
      topics: formData.topics?.filter((t) => t !== topic) || [],
    });
  };

  const handleAddSamplePost = () => {
    if (samplePostInput.trim() && (formData.sample_posts?.length || 0) < 5) {
      setFormData({
        ...formData,
        sample_posts: [...(formData.sample_posts || []), samplePostInput.trim()],
      });
      setSamplePostInput("");
    }
  };

  const handleRemoveSamplePost = (index: number) => {
    setFormData({
      ...formData,
      sample_posts: formData.sample_posts?.filter((_, i) => i !== index) || [],
    });
  };

  const handleDayToggle = (dayId: number) => {
    const currentDays = formData.preferred_posting_days || [];
    if (currentDays.includes(dayId)) {
      setFormData({
        ...formData,
        preferred_posting_days: currentDays.filter((d) => d !== dayId),
      });
    } else {
      setFormData({
        ...formData,
        preferred_posting_days: [...currentDays, dayId].sort(),
      });
    }
  };

  const handleGeneratePreviews = async () => {
    setIsGeneratingPreviews(true);
    setPreviewPosts([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-sample-posts", {
        body: { agentConfig: formData, count: 3 },
      });

      if (error) throw error;

      const posts = data?.posts?.map((p: { content: string }) => p.content) || [];
      setPreviewPosts(posts);

      if (posts.length === 0) {
        toast.error("No posts generated. Please check your configuration.");
      } else {
        toast.success(`Generated ${posts.length} sample posts!`);
      }
    } catch (err) {
      console.error("Failed to generate previews:", err);
      toast.error("Failed to generate sample posts. Please try again.");
    } finally {
      setIsGeneratingPreviews(false);
    }
  };

  const handleSubmit = async () => {
    await createAgent.mutateAsync(formData);
    navigate("/app/agents");
  };

  const isStepValid = () => {
    switch (step) {
      case 1: // Agent Basics
        return formData.name.trim().length > 0 && formData.agent_type;
      case 2: // About User & Company
        return true; // Optional fields
      case 3: // Writing Style Training
        return true; // Optional but recommended
      case 4: // Posting Rules
        return (formData.preferred_posting_days?.length || 0) > 0;
      case 5: // Image Preferences
        return true;
      case 6: // Sample Posts Preview
        return true; // Preview only
      case 7: // Review
        return true;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Agent Basics";
      case 2: return "About You & Your Company";
      case 3: return "Writing Style Training";
      case 4: return "Posting Rules";
      case 5: return "Image Preferences";
      case 6: return "Sample Posts Preview";
      case 7: return "Review & Create";
      default: return "";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 1: return Bot;
      case 2: return User;
      case 3: return FileText;
      case 4: return Clock;
      case 5: return ImageIcon;
      case 6: return Eye;
      case 7: return Check;
      default: return Bot;
    }
  };

  const StepIcon = getStepIcon();

  // Check if user can create more agents
  if (!subLoading && !canCreateAgent(agents.length)) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto py-12">
          <Card className="text-center">
            <CardContent className="p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
                <Bot className="w-8 h-8 text-warning" />
              </div>
              <h2 className="text-xl font-bold">Agent Limit Reached</h2>
              <p className="text-muted-foreground">
                You've used all {subscription?.max_agents || 1} agent slot{(subscription?.max_agents || 1) > 1 ? "s" : ""} on your {subscription?.plan || "free"} plan.
                Upgrade to create more agents and unlock additional features.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => navigate("/app/agents")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Agents
                </Button>
                <Button onClick={() => navigate("/app/billing")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate("/app/agents")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Agent</h1>
            <p className="text-muted-foreground">Step {step} of {TOTAL_STEPS} — {getStepTitle()}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors cursor-pointer ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
              onClick={() => s <= step && setStep(s)}
            />
          ))}
        </div>

        {/* Step 1: Agent Basics */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Agent Identity
              </CardTitle>
              <CardDescription>
                AI agents are like content interns—they draft posts based on your rules and preferences. 
                They cannot act independently and require your approval before publishing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Thought Leader, Hiring Assistant, Content Creator"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  A name to identify this agent in your dashboard
                </p>
              </div>

              <div className="space-y-2">
                <Label>Agent Type *</Label>
                <div className="grid gap-3">
                  {AGENT_TYPES.map((type) => (
                    <div
                      key={type.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.agent_type === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setFormData({ ...formData, agent_type: type.id })}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{type.name}</p>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                        {formData.agent_type === type.id && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">
                  <Target className="w-4 h-4 inline mr-1" />
                  Posting Goal
                </Label>
                <Textarea
                  id="goal"
                  placeholder="e.g., Build thought leadership in AI/ML space, attract senior engineers, share startup journey..."
                  value={formData.posting_goal || ""}
                  onChange={(e) => setFormData({ ...formData, posting_goal: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: About User & Company */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                About You & Your Company
              </CardTitle>
              <CardDescription>Help your agent understand your background and business context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="about_user">
                  <User className="w-4 h-4 inline mr-1" />
                  About You (the person)
                </Label>
                <Textarea
                  id="about_user"
                  placeholder="e.g., I'm the founder of a tech startup, 10+ years in software engineering, passionate about AI and team building..."
                  value={formData.about_user || ""}
                  onChange={(e) => setFormData({ ...formData, about_user: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about_company">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  About Your Company
                </Label>
                <Textarea
                  id="about_company"
                  placeholder="e.g., We're building the future of AI-powered automation. Series A startup, 50 employees, based in SF..."
                  value={formData.about_company || ""}
                  onChange={(e) => setFormData({ ...formData, about_company: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience">
                  <Target className="w-4 h-4 inline mr-1" />
                  Target Audience
                </Label>
                <Textarea
                  id="target_audience"
                  placeholder="e.g., Senior engineers, CTOs, startup founders, tech recruiters, product managers..."
                  value={formData.target_audience || ""}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Tone of Voice
                </Label>
                <Textarea
                  id="tone"
                  placeholder="e.g., Professional but approachable, uses occasional humor, speaks from experience, avoids jargon..."
                  value={formData.tone_of_voice || ""}
                  onChange={(e) => setFormData({ ...formData, tone_of_voice: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Writing Style Training */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Writing Style Training
              </CardTitle>
              <CardDescription>
                Paste your last 3-5 LinkedIn posts. The agent will learn your writing style from these examples.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Sample Posts ({formData.sample_posts?.length || 0}/5)</Label>
                <Textarea
                  placeholder="Paste a LinkedIn post you've written before..."
                  value={samplePostInput}
                  onChange={(e) => setSamplePostInput(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button
                  type="button"
                  onClick={handleAddSamplePost}
                  disabled={!samplePostInput.trim() || (formData.sample_posts?.length || 0) >= 5}
                  className="w-full"
                >
                  Add Sample Post
                </Button>
              </div>

              {formData.sample_posts && formData.sample_posts.length > 0 && (
                <div className="space-y-3">
                  <Label>Added Posts</Label>
                  {formData.sample_posts.map((post, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50 relative group">
                      <p className="text-sm line-clamp-3 pr-8">{post}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                        onClick={() => handleRemoveSamplePost(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> The more examples you provide, the better your agent will understand your writing style. 
                  Include posts with different topics and lengths for best results.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Posting Rules */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Posting Schedule
              </CardTitle>
              <CardDescription>When should this agent create and schedule posts?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Posting Frequency</Label>
                <Select
                  value={formData.posting_frequency}
                  onValueChange={(value) => {
                    let days = formData.preferred_posting_days;
                    if (value === "daily") {
                      days = [0, 1, 2, 3, 4, 5, 6];
                    } else if (value === "weekdays") {
                      days = [1, 2, 3, 4, 5];
                    }
                    setFormData({
                      ...formData,
                      posting_frequency: value,
                      preferred_posting_days: days,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSTING_FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.id} value={freq.id}>
                        {freq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.posting_frequency === "custom" && (
                <div className="space-y-2">
                  <Label>Select Days</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {WEEKDAYS.map((day) => (
                      <div
                        key={day.id}
                        className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
                          formData.preferred_posting_days?.includes(day.id)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleDayToggle(day.id)}
                      >
                        <p className="text-sm font-medium">{day.name.slice(0, 3)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Preferred Time Window</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={formData.preferred_time_window_start}
                    onChange={(e) =>
                      setFormData({ ...formData, preferred_time_window_start: e.target.value })
                    }
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={formData.preferred_time_window_end}
                    onChange={(e) =>
                      setFormData({ ...formData, preferred_time_window_end: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Agent will schedule posts within this time window
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  <Tags className="w-4 h-4 inline mr-1" />
                  Topics / Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a topic..."
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTopic} disabled={!topicInput.trim()}>
                    Add
                  </Button>
                </div>
                {formData.topics && formData.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.topics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveTopic(topic)}
                      >
                        {topic} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Image Preferences */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Image Preferences
              </CardTitle>
              <CardDescription>Configure how your agent handles images in posts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-generate Images</Label>
                  <p className="text-sm text-muted-foreground">
                    Agent will create AI images for posts automatically
                  </p>
                </div>
                <Switch
                  checked={formData.auto_generate_images}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, auto_generate_images: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base">Allow Text-only Posts</Label>
                  <p className="text-sm text-muted-foreground">
                    Agent can create posts without images when appropriate
                  </p>
                </div>
                <Switch
                  checked={formData.allow_text_only_posts}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allow_text_only_posts: checked })
                  }
                />
              </div>

              {formData.auto_generate_images && (
                <div className="space-y-2">
                  <Label>Preferred Image Style</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {IMAGE_STYLES.map((style) => (
                      <div
                        key={style.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.preferred_image_style === style.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setFormData({ ...formData, preferred_image_style: style.id })}
                      >
                        <p className="font-medium text-sm">{style.name}</p>
                        <p className="text-xs text-muted-foreground">{style.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 6: Sample Posts Preview */}
        {step === 6 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Sample Posts Preview
              </CardTitle>
              <CardDescription>
                Preview how your agent will write. These are samples only — they won't be scheduled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {previewPosts.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Generate sample posts to preview your agent's writing style
                  </p>
                  <Button
                    variant="hero"
                    onClick={handleGeneratePreviews}
                    disabled={isGeneratingPreviews}
                  >
                    {isGeneratingPreviews ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Sample Posts
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {previewPosts.length} sample posts generated
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGeneratePreviews}
                      disabled={isGeneratingPreviews}
                    >
                      {isGeneratingPreviews ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Regenerate
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {isGeneratingPreviews ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-lg border">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-4/5 mb-2" />
                          <Skeleton className="h-4 w-3/5" />
                        </div>
                      ))
                    ) : (
                      previewPosts.map((post, index) => (
                        <div key={index} className="p-4 rounded-lg border bg-card">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                              <Bot className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{formData.name}</p>
                              <p className="text-xs text-muted-foreground">Sample Post {index + 1}</p>
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{post}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm">
                      <strong>Note:</strong> These are preview samples only. Once you create the agent, 
                      it will generate fresh, unique posts based on your configuration.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 7: Review & Create */}
        {step === 7 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Review & Create Agent
              </CardTitle>
              <CardDescription>
                Review your agent configuration before creating.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Agent Basics */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <h3 className="font-medium">Agent Basics</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-medium">{formData.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium">
                        {AGENT_TYPES.find((t) => t.id === formData.agent_type)?.name}
                      </span>
                    </div>
                  </div>
                  {formData.posting_goal && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      Goal: {formData.posting_goal}
                    </p>
                  )}
                </div>

                {/* Schedule */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <h3 className="font-medium">Posting Schedule</h3>
                  </div>
                  <div className="text-sm">
                    <p>
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="ml-2 font-medium">
                        {POSTING_FREQUENCIES.find((f) => f.id === formData.posting_frequency)?.name}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Time Window:</span>
                      <span className="ml-2 font-medium">
                        {formData.preferred_time_window_start} - {formData.preferred_time_window_end}
                      </span>
                    </p>
                    {formData.topics && formData.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.topics.map((topic) => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Training */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="font-medium">Training Data</h3>
                  </div>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Sample posts:</span>
                    <span className="ml-2 font-medium">
                      {formData.sample_posts?.length || 0} provided
                    </span>
                  </p>
                </div>

                {/* Images */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <h3 className="font-medium">Image Settings</h3>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Auto-generate:</span>
                      <span className="ml-2 font-medium">{formData.auto_generate_images ? "Yes" : "No"}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Text-only allowed:</span>
                      <span className="ml-2 font-medium">{formData.allow_text_only_posts ? "Yes" : "No"}</span>
                    </p>
                    {formData.auto_generate_images && (
                      <p>
                        <span className="text-muted-foreground">Style:</span>
                        <span className="ml-2 font-medium">
                          {IMAGE_STYLES.find((s) => s.id === formData.preferred_image_style)?.name}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent Behavior Notice */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  About AI Agents
                </h4>
                <p className="text-sm text-muted-foreground">
                  Agents are AI assistants that draft and schedule posts based on user-defined rules. 
                  All content is created according to your preferences and schedule settings. 
                  You can review, edit, pause, or delete posts at any time before they are published.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate("/app/agents"))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step > 1 ? "Back" : "Cancel"}
          </Button>
          <Button
            variant="hero"
            onClick={() => (step < TOTAL_STEPS ? setStep(step + 1) : handleSubmit())}
            disabled={!isStepValid() || (step === TOTAL_STEPS && createAgent.isPending)}
          >
            {step < TOTAL_STEPS ? (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : createAgent.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Agent
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateAgent;
