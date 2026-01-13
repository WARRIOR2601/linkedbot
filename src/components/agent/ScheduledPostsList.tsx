import { format, formatDistanceToNow, parseISO, isPast } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Play,
  Pause,
  SkipForward,
  Clock,
  Calendar,
  Bot,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
} from "lucide-react";
import { useScheduledPosts, ScheduledPost, ScheduledPostStatus } from "@/hooks/useScheduledPosts";
import { useAgents } from "@/hooks/useAgents";

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

const PostCard = ({ 
  post, 
  agentName,
  onPostNow, 
  onSkip, 
  onTogglePause,
  onDelete,
  isUpdating,
}: { 
  post: ScheduledPost;
  agentName: string | null;
  onPostNow: () => void;
  onSkip: () => void;
  onTogglePause: () => void;
  onDelete: () => void;
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
          <Calendar className="w-3 h-3" />
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
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Button
            variant="default"
            size="sm"
            onClick={onPostNow}
            disabled={isUpdating}
            className="flex-1"
          >
            <Send className="w-3 h-3 mr-1" />
            Post Now
          </Button>
          
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
    isUpdating,
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

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Scheduled Posts
          {scheduledPosts.filter(p => p.status === "pending").length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {scheduledPosts.filter(p => p.status === "pending").length} pending
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayPosts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No scheduled posts</p>
            <p className="text-sm">Your agent will create posts based on your settings</p>
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
