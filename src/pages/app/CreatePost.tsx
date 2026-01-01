import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { AI_MODELS, AVAILABLE_TAGS, POST_LENGTHS, AIModelId, PostLength } from "@/lib/ai-models";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScheduleDialog } from "@/components/posts/ScheduleDialog";
import PostImageUpload from "@/components/posts/PostImageUpload";
import { 
  Briefcase, Users, Smile, BookOpen, Rocket, MessageCircle,
  Sparkles, Wand2, Save, Calendar, RefreshCw, Copy, Check,
  ChevronRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const iconMap = {
  Briefcase,
  Users,
  Smile,
  BookOpen,
  Rocket,
  MessageCircle,
};

const CreatePost = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { createPost } = usePosts();
  
  const [selectedModel, setSelectedModel] = useState<AIModelId>("professional");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [guidance, setGuidance] = useState("");
  const [postLength, setPostLength] = useState<PostLength>("medium");
  
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      toast.error("Maximum 5 tags allowed");
    }
  };

  const generatePost = async () => {
    if (!session?.access_token) {
      toast.error("Please log in to generate posts");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            aiModel: selectedModel,
            tags: selectedTags,
            guidance,
            postLength,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate post");
      }

      setGeneratedContent(data.content);
      setGeneratedHashtags(data.hashtags || []);
      toast.success("Post generated successfully!");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate post");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAsDraft = async () => {
    if (!generatedContent) {
      toast.error("Generate content first");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await createPost({
        content: generatedContent,
        ai_model: selectedModel,
        tags: selectedTags,
        hashtags: generatedHashtags,
        post_length: postLength,
        guidance: guidance || null,
        image_url: imageUrl,
        status: "draft",
        scheduled_at: null,
      });

      if (error) throw new Error(error);
      toast.success("Post saved as draft!");
      navigate("/app/calendar");
    } catch (error: any) {
      toast.error(error.message || "Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchedule = async (scheduledAt: string) => {
    if (!generatedContent) {
      toast.error("Generate content first");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await createPost({
        content: generatedContent,
        ai_model: selectedModel,
        tags: selectedTags,
        hashtags: generatedHashtags,
        post_length: postLength,
        guidance: guidance || null,
        image_url: imageUrl,
        status: "scheduled",
        scheduled_at: scheduledAt,
      });

      if (error) throw new Error(error);
      toast.success("Post scheduled successfully!");
      setScheduleDialogOpen(false);
      navigate("/app/calendar");
    } catch (error: any) {
      toast.error(error.message || "Failed to schedule post");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    const fullContent = generatedContent + 
      (generatedHashtags.length > 0 ? "\n\n" + generatedHashtags.map(h => `#${h}`).join(" ") : "");
    
    await navigator.clipboard.writeText(fullContent);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Create Post</h1>
          <p className="text-muted-foreground mt-1">
            Generate AI-powered LinkedIn content tailored to your brand
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* AI Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Post Style
                </CardTitle>
                <CardDescription>
                  Choose the tone and style for your post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {AI_MODELS.map((model) => {
                  const Icon = iconMap[model.icon as keyof typeof iconMap];
                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedModel === model.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${
                          selectedModel === model.id ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            selectedModel === model.id ? "text-primary" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{model.name}</p>
                          <p className="text-xs text-muted-foreground">{model.description}</p>
                        </div>
                        {selectedModel === model.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Tags Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Tags</CardTitle>
                <CardDescription>
                  Select up to 5 tags to guide content themes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Post Length & Guidance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Post Length</Label>
                  <Select value={postLength} onValueChange={(v) => setPostLength(v as PostLength)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POST_LENGTHS.map((length) => (
                        <SelectItem key={length.id} value={length.id}>
                          {length.name} ({length.description})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Additional Guidance (Optional)</Label>
                  <Textarea
                    value={guidance}
                    onChange={(e) => setGuidance(e.target.value)}
                    placeholder="E.g., 'Focus on our recent product launch' or 'Include a call to action for demos'"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <PostImageUpload
              imageUrl={imageUrl}
              onImageChange={setImageUrl}
              postContent={generatedContent}
              tags={selectedTags}
            />

            <Button 
              onClick={generatePost} 
              disabled={isGenerating}
              className="w-full h-12 text-base"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Post
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-6">
            <Card className="min-h-[500px]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Generated Post</span>
                  {generatedContent && (
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-4 w-[95%]" />
                    <Skeleton className="h-4 w-[70%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[85%]" />
                  </div>
                ) : generatedContent ? (
                  <div className="space-y-4">
                    <Textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="min-h-[300px] text-sm leading-relaxed"
                    />
                    {generatedHashtags.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          Suggested Hashtags
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {generatedHashtags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-center">
                    <div className="text-muted-foreground">
                      <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Configure your post settings and click Generate</p>
                      <p className="text-sm mt-1">AI will create personalized content</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {generatedContent && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={generatePost}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
                <Button
                  variant="secondary"
                  onClick={saveAsDraft}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  onClick={() => setScheduleDialogOpen(true)}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSchedule={handleSchedule}
        isLoading={isSaving}
      />
    </AppLayout>
  );
};

export default CreatePost;
