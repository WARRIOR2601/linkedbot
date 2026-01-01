import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  RefreshCw,
  Calendar,
  Send,
  Lightbulb,
  FileText,
  TrendingUp,
  MessageSquare,
  Award,
  BookOpen,
  Copy,
  Check,
} from "lucide-react";

const postTypes = [
  { id: "thought-leadership", label: "Thought Leadership", icon: Lightbulb, description: "Share your expertise" },
  { id: "story", label: "Personal Story", icon: BookOpen, description: "Connect through storytelling" },
  { id: "tips", label: "How-To / Tips", icon: FileText, description: "Teach something valuable" },
  { id: "engagement", label: "Engagement Hook", icon: MessageSquare, description: "Spark conversation" },
  { id: "achievement", label: "Win/Achievement", icon: Award, description: "Celebrate milestones" },
  { id: "trend", label: "Industry Trend", icon: TrendingUp, description: "Comment on trends" },
];

const CreatePost = () => {
  const [selectedType, setSelectedType] = useState("thought-leadership");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedContent(
        `🚀 Here's a truth about ${topic || "leadership"} that took me years to learn:\n\nThe best leaders don't have all the answers. They have the best questions.\n\nI used to think being in charge meant knowing everything. But after 10 years in tech, I've realized:\n\n→ Asking "What do you think?" builds trust\n→ Saying "I don't know" invites collaboration\n→ Admitting mistakes creates psychological safety\n\nThe most powerful phrase a leader can use?\n\n"Help me understand."\n\nIt's not weakness. It's wisdom.\n\nWhat's the most valuable lesson you've learned about leadership?\n\n#Leadership #Growth #CareerAdvice`
      );
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Create Post</h1>
          <p className="text-muted-foreground">Generate engaging LinkedIn content with AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Post Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Post Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {postTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedType === type.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <type.icon
                        className={`w-5 h-5 mb-2 ${
                          selectedType === type.id ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Topic Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Topic & Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Main Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Remote work productivity tips"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="context">Additional Context (optional)</Label>
                  <Textarea
                    id="context"
                    placeholder="Add any specific points, experiences, or angles you want to include..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <select className="w-full h-11 rounded-lg border border-border bg-secondary/50 px-4 text-sm">
                    <option>Professional</option>
                    <option>Conversational</option>
                    <option>Inspirational</option>
                    <option>Educational</option>
                    <option>Humorous</option>
                  </select>
                </div>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Generated Content</CardTitle>
                {generatedContent && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleGenerate}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                      {copied ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ) : generatedContent ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 min-h-[300px]">
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-medium text-primary-foreground">
                          JD
                        </div>
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-xs text-muted-foreground">Marketing Director | Growth Expert</p>
                        </div>
                      </div>
                      <div className="whitespace-pre-wrap text-sm">{generatedContent}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="hero" className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        Post Now
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Ready to Create</h3>
                    <p className="text-sm text-muted-foreground max-w-[250px]">
                      Select a post type, enter your topic, and click generate to create your post.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreatePost;
