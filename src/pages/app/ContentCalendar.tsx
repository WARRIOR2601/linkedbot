import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, addWeeks, addMonths, parseISO } from "date-fns";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePosts, Post } from "@/hooks/usePosts";
import { useAgents, AGENT_TYPES } from "@/hooks/useAgents";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Bot,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ContentCalendar = () => {
  const navigate = useNavigate();
  const { posts, isLoading: postsLoading, updatePost, refetch } = usePosts();
  const { agents, isLoading: agentsLoading } = useAgents();
  
  const [view, setView] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [uploadingForDate, setUploadingForDate] = useState<Date | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = postsLoading || agentsLoading;

  // Only show scheduled and posted posts (agent-created)
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => p.status === "scheduled" || p.status === "posted");
  }, [posts]);

  const getWeekDates = () => {
    const week = [];
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    for (let i = 0; i < 7; i++) {
      week.push(addDays(start, i));
    }
    return week;
  };

  const getMonthDates = () => {
    const monthStart = startOfMonth(currentDate);
    const start = startOfWeek(monthStart, { weekStartsOn: 0 });
    const dates = [];

    let day = start;
    while (dates.length < 42) {
      dates.push({
        date: day,
        isCurrentMonth: isSameMonth(day, currentDate),
      });
      day = addDays(day, 1);
    }
    return dates;
  };

  const getPostsForDate = (date: Date) => {
    return filteredPosts.filter((post) => {
      return post.scheduled_at && isSameDay(parseISO(post.scheduled_at), date);
    });
  };

  const getAgentForPost = (post: Post) => {
    return agents.find((a) => a.id === post.agent_id);
  };

  const navigateWeek = (direction: number) => {
    setCurrentDate((prev) => addWeeks(prev, direction));
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => addMonths(prev, direction));
  };

  // Handle image upload for a specific date
  const handleImageUpload = async (file: File, targetDate: Date) => {
    setIsUploading(true);
    try {
      // Get current user for storage path
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to upload images");
        return;
      }

      // Upload to storage with user-scoped path
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Image upload failed. Please try again.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);

      // Find if there's already a post for this date
      const existingPost = filteredPosts.find(
        (p) => p.scheduled_at && isSameDay(parseISO(p.scheduled_at), targetDate)
      );

      if (existingPost) {
        // Update existing post with new image
        await updatePost(existingPost.id, { image_url: urlData.publicUrl });
        toast.success("Image added to scheduled post");
      } else {
        // Create a draft post with the image for agents to use
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const scheduleTime = new Date(targetDate);
          scheduleTime.setHours(9, 0, 0, 0);

          await supabase.from("posts").insert({
            user_id: user.id,
            content: "",
            image_url: urlData.publicUrl,
            status: "draft",
            scheduled_at: scheduleTime.toISOString(),
            ai_model: "agent",
            post_length: "medium",
          });
          toast.success("Image uploaded - agent will create post for this date");
        }
      }

      refetch();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      setUploadingForDate(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingForDate) {
      handleImageUpload(file, uploadingForDate);
    }
    e.target.value = "";
  };

  const triggerUploadForDate = (date: Date) => {
    setUploadingForDate(date);
    fileInputRef.current?.click();
  };

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <TooltipProvider>
      <div className="space-y-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Content Calendar</h1>
            <p className="text-muted-foreground">View and supervise agent-planned posts</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setView("week")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  view === "week" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView("month")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  view === "month" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Month
              </button>
            </div>
            <Button variant="outline" onClick={() => navigate("/app/agents")}>
              <Bot className="w-4 h-4 mr-2" />
              Manage Agents
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm">
              <span className="font-medium">Supervision Mode:</span> View posts planned by your agents. 
              Upload an image on any date to guide the agent's post for that day.
            </p>
          </CardContent>
        </Card>

        {/* Posting Status Banner */}
        <Alert className="border-warning/50 bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Scheduled Posts — Pending LinkedIn Approval</AlertTitle>
          <AlertDescription className="text-warning/80 flex items-center gap-2">
            <span>Posts shown here are saved and scheduled. They will be published to LinkedIn once API approval is complete.</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>LinkedIn requires all third-party apps to be approved before posting. Your content is safely stored.</p>
              </TooltipContent>
            </Tooltip>
          </AlertDescription>
        </Alert>

        {/* Calendar Navigation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (view === "week" ? navigateWeek(-1) : navigateMonth(-1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold">
              {view === "week"
                ? `${months[weekDates[0].getMonth()]} ${weekDates[0].getDate()} - ${
                    months[weekDates[6].getMonth()]
                  } ${weekDates[6].getDate()}, ${weekDates[6].getFullYear()}`
                : `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (view === "week" ? navigateWeek(1) : navigateMonth(1))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            {view === "week" ? (
              // Week View
              <div className="grid grid-cols-7 gap-4">
                {weekDates.map((date, index) => {
                  const dayPosts = getPostsForDate(date);
                  const isToday = isSameDay(date, new Date());
                  const isFuture = date >= new Date();

                  return (
                    <div
                      key={index}
                      className={`min-h-[200px] rounded-lg border ${
                        isToday ? "border-primary bg-primary/5" : "border-border"
                      } p-3`}
                    >
                      <div className="text-center mb-3">
                        <p className="text-xs text-muted-foreground">{daysOfWeek[date.getDay()]}</p>
                        <p className={`text-lg font-semibold ${isToday ? "text-primary" : ""}`}>
                          {date.getDate()}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {/* Posts */}
                        {dayPosts.map((post) => {
                          const agent = getAgentForPost(post);
                          return (
                            <div
                              key={post.id}
                              onClick={() => setSelectedPost(post)}
                              className={`p-2 rounded-md text-xs cursor-pointer transition-all hover:scale-[1.02] ${
                                post.status === "posted"
                                  ? "bg-success/20 border border-success/30"
                                  : "bg-primary/20 border border-primary/30"
                              }`}
                            >
                              <div className="flex items-start gap-1">
                                <div className="min-w-0 flex-1">
                                  {agent && (
                                    <div className="flex items-center gap-1 mb-1">
                                      <Bot className="w-3 h-3" />
                                      <span className="font-medium truncate">{agent.name}</span>
                                    </div>
                                  )}
                                  <p className="truncate text-muted-foreground">
                                    {post.content.slice(0, 40)}...
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="w-3 h-3" />
                                      {post.scheduled_at && format(parseISO(post.scheduled_at), "HH:mm")}
                                    </span>
                                    {post.image_url && <ImageIcon className="w-3 h-3" />}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Upload Image Button (only for future dates with no posts) */}
                        {isFuture && dayPosts.length === 0 && (
                          <button
                            onClick={() => triggerUploadForDate(date)}
                            disabled={isUploading}
                            className="w-full p-3 rounded-md border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-xs text-muted-foreground flex flex-col items-center gap-1"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Upload image</span>
                          </button>
                        )}

                        {/* Add image to existing post */}
                        {isFuture && dayPosts.length > 0 && !dayPosts[0].image_url && (
                          <button
                            onClick={() => triggerUploadForDate(date)}
                            disabled={isUploading}
                            className="w-full p-2 rounded-md border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-xs text-muted-foreground flex items-center justify-center gap-1"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Add image</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Month View
              <div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthDates.map(({ date, isCurrentMonth }, index) => {
                    const dayPosts = getPostsForDate(date);
                    const isToday = isSameDay(date, new Date());
                    const isFuture = date >= new Date();

                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] rounded-lg p-2 ${
                          isCurrentMonth ? "" : "opacity-30"
                        } ${
                          isToday
                            ? "bg-primary/10 border border-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <p className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                          {date.getDate()}
                        </p>
                        <div className="space-y-1">
                          {dayPosts.slice(0, 2).map((post) => {
                            const agent = getAgentForPost(post);
                            return (
                              <div
                                key={post.id}
                                onClick={() => setSelectedPost(post)}
                                className={`p-1 rounded text-xs truncate cursor-pointer ${
                                  post.status === "posted"
                                    ? "bg-success/20"
                                    : "bg-primary/20"
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  <Bot className="w-2 h-2 shrink-0" />
                                  <span className="truncate">{agent?.name || "Agent"}</span>
                                </div>
                              </div>
                            );
                          })}
                          {dayPosts.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{dayPosts.length - 2} more
                            </p>
                          )}
                          {isFuture && isCurrentMonth && dayPosts.length === 0 && (
                            <button
                              onClick={() => triggerUploadForDate(date)}
                              className="w-full p-1 rounded text-xs text-muted-foreground hover:bg-muted flex items-center justify-center"
                            >
                              <Upload className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Post Preview Dialog */}
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Post Preview
              </DialogTitle>
            </DialogHeader>
            {selectedPost && (
              <div className="space-y-4">
                {/* Agent Info */}
                {getAgentForPost(selectedPost) && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Bot className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{getAgentForPost(selectedPost)?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {AGENT_TYPES.find(t => t.id === getAgentForPost(selectedPost)?.agent_type)?.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status & Time */}
                <div className="flex items-center gap-4">
                  <Badge variant={selectedPost.status === "posted" ? "default" : "secondary"}>
                    {selectedPost.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedPost.scheduled_at && format(parseISO(selectedPost.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>

                {/* Image */}
                {selectedPost.image_url && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={selectedPost.image_url}
                      alt="Post image"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">{selectedPost.content}</p>
                </div>

                {/* Hashtags */}
                {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.hashtags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Posts are created and managed by agents. You can upload images to guide content.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      </TooltipProvider>
    </AppLayout>
  );
};

export default ContentCalendar;
