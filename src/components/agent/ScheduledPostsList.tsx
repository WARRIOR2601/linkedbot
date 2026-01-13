import { useState } from "react";
import { format, formatDistanceToNow, parseISO, isPast, setHours, setMinutes, addMinutes, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  SkipForward,
  Clock,
  Calendar as CalendarIcon,
  Bot,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  CalendarClock,
  Plus,
  FileText,
} from "lucide-react";
import { useScheduledPosts, ScheduledPost, ScheduledPostStatus } from "@/hooks/useScheduledPosts";
import { useAgents } from "@/hooks/useAgents";
import { cn } from "@/lib/utils";

interface ScheduledPostsListProps {
  showAll?: boolean;
  maxPosts?: number;
  className?: string;
}

const getStatusBadge = (status: ScheduledPostStatus) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-primary/10 text-primary border-primary/20">Pending</Badge>;
    case "paused":
      return <Badge variant="secondary">Paused</Badge>;
    case "published":
      return <Badge className="bg-success/10 text-success border-success/20">Published</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "skipped":
      return <Badge variant="outline" className="text-muted-foreground">Skipped</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Quick schedule options
const QUICK_SCHEDULE_OPTIONS = [
  { label: "In 10 minutes", value: () => addMinutes(new Date(), 10) },
  { label: "In 1 hour", value: () => addMinutes(new Date(), 60) },
  { label: "In 3 hours", value: () => addMinutes(new Date(), 180) },
  { label: "Tomorrow 9 AM", value: () => setHours(setMinutes(addDays(new Date(), 1), 0), 9) },
  { label: "Tomorrow 12 PM", value: () => setHours(setMinutes(addDays(new Date(), 1), 0), 12) },
  { label: "Custom", value: null },
];

const CreatePostDialog = ({
  onCreatePost,
  isCreating,
  agents,
}: {
  onCreatePost: (data: { content: string; scheduledFor: Date; agentId?: string | null }) => void;
  isCreating: boolean;
  agents: { id: string; name: string }[];
}) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<string>("quick");
  const [quickOption, setQuickOption] = useState<string>("In 1 hour");
  const [customDate, setCustomDate] = useState<Date>(addDays(new Date(), 1));
  const [customTime, setCustomTime] = useState("09:00");

  const getScheduledDate = () => {
    if (scheduleType === "quick") {
      const option = QUICK_SCHEDULE_OPTIONS.find(o => o.label === quickOption);
      return option?.value ? option.value() : new Date();
    } else {
      const [hours, minutes] = customTime.split(":").map(Number);
      return setMinutes(setHours(customDate, hours), minutes);
    }
  };

  const handleCreate = () => {
    if (!content.trim()) return;
    const scheduledFor = getScheduledDate();
    onCreatePost({
      content: content.trim(),
      scheduledFor,
      agentId: selectedAgent || null,
    });
    setOpen(false);
    setContent("");
    setSelectedAgent("");
    setScheduleType("quick");
    setQuickOption("In 1 hour");
  };

  const scheduledDate = getScheduledDate();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Schedule Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule a New Post</DialogTitle>
          <DialogDescription>
            Write your LinkedIn post content and choose when to publish it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Post Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Post Content</Label>
            <Textarea
              id="content"
              placeholder="Write your LinkedIn post here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length} characters
            </p>
          </div>

          {/* Agent Selection */}
          {agents.length > 0 && (
            <div className="space-y-2">
              <Label>Associate with Agent (optional)</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="No agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No agent</SelectItem>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-3 h-3" />
                        {agent.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Schedule Type */}
          <div className="space-y-2">
            <Label>When to post</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={scheduleType === "quick" ? "default" : "outline"}
                size="sm"
                onClick={() => setScheduleType("quick")}
              >
                Quick Options
              </Button>
              <Button
                type="button"
                variant={scheduleType === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => setScheduleType("custom")}
              >
                Custom Date & Time
              </Button>
            </div>
          </div>

          {/* Quick Schedule Options */}
          {scheduleType === "quick" && (
            <div className="grid grid-cols-2 gap-2">
              {QUICK_SCHEDULE_OPTIONS.filter(o => o.value).map(option => (
                <Button
                  key={option.label}
                  type="button"
                  variant={quickOption === option.label ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuickOption(option.label)}
                  className="justify-start"
                >
                  <Clock className="w-3 h-3 mr-2" />
                  {option.label}
                </Button>
              ))}
            </div>
          )}

          {/* Custom Date/Time */}
          {scheduleType === "custom" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={customDate}
                  onSelect={(date) => date && setCustomDate(date)}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customTime">Select Time</Label>
                <Input
                  id="customTime"
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="p-3 rounded-lg bg-muted/50 text-sm border">
            <p className="font-medium flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Scheduled for:
            </p>
            <p className="text-muted-foreground mt-1">
              {format(scheduledDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ({formatDistanceToNow(scheduledDate, { addSuffix: true })})
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !content.trim()}>
            <CalendarClock className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RescheduleDialog = ({
  post,
  onReschedule,
  isUpdating,
}: {
  post: ScheduledPost;
  onReschedule: (date: Date) => void;
  isUpdating: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(parseISO(post.scheduled_for));
  const [time, setTime] = useState(format(parseISO(post.scheduled_for), "HH:mm"));

  const handleReschedule = () => {
    const [hours, minutes] = time.split(":").map(Number);
    const newDate = setMinutes(setHours(selectedDate, hours), minutes);
    onReschedule(newDate);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarClock className="w-3 h-3 mr-1" />
          Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Post</DialogTitle>
          <DialogDescription>
            Choose a new date and time for this post to be published.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Select Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <p className="font-medium">Scheduled for:</p>
            <p className="text-muted-foreground">
              {format(setMinutes(setHours(selectedDate, parseInt(time.split(":")[0])), parseInt(time.split(":")[1])), "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleReschedule} disabled={isUpdating}>
            <CalendarClock className="w-4 h-4 mr-2" />
            Reschedule Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PostCard = ({ 
  post, 
  agentName,
  onPostNow, 
  onSkip, 
  onTogglePause,
  onDelete,
  onReschedule,
  isUpdating,
}: { 
  post: ScheduledPost;
  agentName: string | null;
  onPostNow: () => void;
  onSkip: () => void;
  onTogglePause: () => void;
  onDelete: () => void;
  onReschedule: (date: Date) => void;
  isUpdating: boolean;
}) => {
  const scheduledDate = parseISO(post.scheduled_for);
  const isOverdue = isPast(scheduledDate) && post.status === "pending";
  const canModify = post.status === "pending" || post.status === "paused";

  return (
    <div className="p-4 border rounded-lg space-y-3 hover:bg-muted/30 transition-colors">
      {/* Header: Status, Agent, Time */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge(post.status)}
          {agentName && (
            <Badge variant="outline" className="text-xs">
              <Bot className="w-3 h-3 mr-1" />
              {agentName}
            </Badge>
          )}
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Overdue
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
          <CalendarIcon className="w-3 h-3" />
          {format(scheduledDate, "MMM d, h:mm a")}
        </div>
      </div>

      {/* Content Preview */}
      <p className="text-sm line-clamp-3">{post.content}</p>

      {/* Timing */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        {isPast(scheduledDate) 
          ? `Was scheduled ${formatDistanceToNow(scheduledDate)} ago`
          : `Scheduled ${formatDistanceToNow(scheduledDate, { addSuffix: true })}`
        }
      </div>

      {/* Actions */}
      {canModify && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <Button
            variant="default"
            size="sm"
            onClick={onPostNow}
            disabled={isUpdating}
          >
            <Send className="w-3 h-3 mr-1" />
            Post Now
          </Button>
          
          <RescheduleDialog
            post={post}
            onReschedule={onReschedule}
            isUpdating={isUpdating}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePause}
            disabled={isUpdating}
          >
            {post.status === "paused" ? (
              <>
                <Play className="w-3 h-3 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSkip}
            disabled={isUpdating}
          >
            <SkipForward className="w-3 h-3 mr-1" />
            Skip
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Post</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this scheduled post? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Published/Failed state */}
      {post.status === "published" && post.posted_at && (
        <div className="flex items-center gap-1 text-xs text-success pt-2 border-t border-border/50">
          <CheckCircle2 className="w-3 h-3" />
          Published {formatDistanceToNow(parseISO(post.posted_at), { addSuffix: true })}
        </div>
      )}

      {post.status === "failed" && (
        <div className="flex items-center gap-1 text-xs text-destructive pt-2 border-t border-border/50">
          <XCircle className="w-3 h-3" />
          Failed to publish
        </div>
      )}
    </div>
  );
};

export const ScheduledPostsList = ({ 
  showAll = false, 
  maxPosts = 5,
  className,
}: ScheduledPostsListProps) => {
  const { 
    scheduledPosts, 
    isLoading, 
    postNow, 
    skipPost, 
    togglePause, 
    deletePost,
    reschedulePost,
    createPost,
    isUpdating,
    isCreating,
  } = useScheduledPosts();
  const { agents } = useAgents();

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return null;
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || null;
  };

  // Filter and limit posts
  const displayPosts = showAll 
    ? scheduledPosts 
    : scheduledPosts
        .filter(p => p.status === "pending" || p.status === "paused")
        .slice(0, maxPosts);

  // Next upcoming post
  const nextPost = scheduledPosts
    .filter(p => p.status === "pending" && new Date(p.scheduled_for) > new Date())
    .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime())[0];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Scheduled Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Scheduled Posts
            {scheduledPosts.filter(p => p.status === "pending").length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {scheduledPosts.filter(p => p.status === "pending").length} pending
              </Badge>
            )}
          </CardTitle>
          {nextPost && (
            <p className="text-sm text-muted-foreground mt-1">
              Next: {format(parseISO(nextPost.scheduled_for), "MMM d 'at' h:mm a")} ({formatDistanceToNow(parseISO(nextPost.scheduled_for), { addSuffix: true })})
            </p>
          )}
        </div>
        <CreatePostDialog
          onCreatePost={createPost}
          isCreating={isCreating}
          agents={agents.map(a => ({ id: a.id, name: a.name }))}
        />
      </CardHeader>
      <CardContent>
        {displayPosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No scheduled posts yet</p>
            <p className="text-sm mb-4">Create your first post to see it here</p>
            <CreatePostDialog
              onCreatePost={createPost}
              isCreating={isCreating}
              agents={agents.map(a => ({ id: a.id, name: a.name }))}
            />
          </div>
        ) : (
          <ScrollArea className={showAll ? "h-[500px]" : ""}>
            <div className="space-y-3">
              {displayPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  agentName={getAgentName(post.agent_id)}
                  onPostNow={() => postNow(post.id)}
                  onSkip={() => skipPost(post.id)}
                  onTogglePause={() => togglePause({ postId: post.id, currentStatus: post.status })}
                  onDelete={() => deletePost(post.id)}
                  onReschedule={(date) => reschedulePost({ postId: post.id, scheduledFor: date })}
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {!showAll && scheduledPosts.filter(p => p.status === "pending" || p.status === "paused").length > maxPosts && (
          <div className="mt-4 pt-4 border-t text-center">
            <Button variant="outline" size="sm" asChild>
              <a href="/app/calendar">View All Posts</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
