import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAgents, AGENT_TYPES, POSTING_FREQUENCIES, WEEKDAYS, CreateAgentInput } from "@/hooks/useAgents";
import { Bot, ArrowLeft, Sparkles, Clock, Target, MessageSquare, Tags } from "lucide-react";

const CreateAgent = () => {
  const navigate = useNavigate();
  const { createAgent } = useAgents();

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
  });

  const [topicInput, setTopicInput] = useState("");

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

  const handleSubmit = async () => {
    await createAgent.mutateAsync(formData);
    navigate("/app/agents");
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0 && formData.agent_type;
      case 2:
        return true; // Optional fields
      case 3:
        return (formData.preferred_posting_days?.length || 0) > 0;
      default:
        return false;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/agents")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Agent</h1>
            <p className="text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Agent Identity
              </CardTitle>
              <CardDescription>Give your agent a name and purpose</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Thought Leader, Hiring Bot, Content Creator"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  A name to identify this agent in your dashboard
                </p>
              </div>

              <div className="space-y-2">
                <Label>Agent Type</Label>
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
            </CardContent>
          </Card>
        )}

        {/* Step 2: Voice & Topics */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Voice & Content
              </CardTitle>
              <CardDescription>Define how your agent writes and what topics to cover</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div className="space-y-2">
                <Label htmlFor="tone">Tone of Voice</Label>
                <Textarea
                  id="tone"
                  placeholder="e.g., Professional but approachable, uses occasional humor, speaks from experience..."
                  value={formData.tone_of_voice || ""}
                  onChange={(e) => setFormData({ ...formData, tone_of_voice: e.target.value })}
                  className="min-h-[80px]"
                />
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
                <p className="text-xs text-muted-foreground">
                  Agent will create content around these topics
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Posting Schedule
              </CardTitle>
              <CardDescription>When should this agent post?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Posting Frequency</Label>
                <Select
                  value={formData.posting_frequency}
                  onValueChange={(value) => {
                    setFormData({ ...formData, posting_frequency: value });
                    if (value === "daily") {
                      setFormData({
                        ...formData,
                        posting_frequency: value,
                        preferred_posting_days: [0, 1, 2, 3, 4, 5, 6],
                      });
                    } else if (value === "weekdays") {
                      setFormData({
                        ...formData,
                        posting_frequency: value,
                        preferred_posting_days: [1, 2, 3, 4, 5],
                      });
                    }
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
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => (step > 1 ? setStep(step - 1) : navigate("/app/agents"))}>
            {step > 1 ? "Back" : "Cancel"}
          </Button>
          <Button
            variant="hero"
            onClick={() => (step < 3 ? setStep(step + 1) : handleSubmit())}
            disabled={!isStepValid() || (step === 3 && createAgent.isPending)}
          >
            {step < 3 ? "Continue" : createAgent.isPending ? "Creating..." : "Create Agent"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateAgent;
