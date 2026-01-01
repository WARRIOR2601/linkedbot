import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, addWeeks, addMonths, parseISO } from "date-fns";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { usePosts, Post } from "@/hooks/usePosts";
import { useUpcomingEvents, UpcomingEvent } from "@/hooks/useUpcomingEvents";
import { EditPostDialog } from "@/components/posts/EditPostDialog";
import { EventDialog } from "@/components/events/EventDialog";
import { AI_MODELS } from "@/lib/ai-models";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  Flag,
  GripVertical,
} from "lucide-react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ContentCalendar = () => {
  const navigate = useNavigate();
  const { posts, isLoading: postsLoading, updatePost, deletePost, refetch } = usePosts();
  const { events, isLoading: eventsLoading, createEvent, updateEvent, deleteEvent } = useUpcomingEvents();
  
  const [view, setView] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDrafts, setShowDrafts] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UpcomingEvent | null>(null);
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);

  const isLoading = postsLoading || eventsLoading;

  // Filter posts based on showDrafts toggle
  const filteredPosts = useMemo(() => {
    if (showDrafts) return posts;
    return posts.filter((p) => p.status === "scheduled");
  }, [posts, showDrafts]);

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
    const monthEnd = endOfMonth(currentDate);
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
      if (post.status === "draft") {
        return isSameDay(parseISO(post.created_at), date);
      }
      return post.scheduled_at && isSameDay(parseISO(post.scheduled_at), date);
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(parseISO(event.event_date), date));
  };

  const navigateWeek = (direction: number) => {
    setCurrentDate((prev) => addWeeks(prev, direction));
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => addMonths(prev, direction));
  };

  const handlePostUpdate = async (id: string, updates: Partial<Post>) => {
    const result = await updatePost(id, updates);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Post updated successfully");
    }
    return result;
  };

  const handlePostDelete = async (id: string) => {
    const result = await deletePost(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Post deleted successfully");
    }
    return result;
  };

  const handleEventSave = async (data: { title: string; description: string | null; event_date: string; event_type: string }) => {
    if (editingEvent) {
      const result = await updateEvent(editingEvent.id, data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Event updated");
      }
      return result;
    } else {
      const result = await createEvent(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Event created");
      }
      return result;
    }
  };

  const handleEventDelete = async (id: string) => {
    const result = await deleteEvent(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Event deleted");
    }
    return result;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, post: Post) => {
    setDraggedPost(post);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedPost) return;

    // Only allow rescheduling for scheduled posts
    if (draggedPost.status !== "scheduled") {
      toast.error("Only scheduled posts can be rescheduled by dragging");
      setDraggedPost(null);
      return;
    }

    const existingTime = draggedPost.scheduled_at 
      ? format(parseISO(draggedPost.scheduled_at), "HH:mm:ss")
      : "09:00:00";
    
    const newScheduledAt = new Date(targetDate);
    const [hours, minutes, seconds] = existingTime.split(":").map(Number);
    newScheduledAt.setHours(hours, minutes, seconds);

    // Validate future date
    if (newScheduledAt < new Date()) {
      toast.error("Cannot schedule posts in the past");
      setDraggedPost(null);
      return;
    }

    const result = await updatePost(draggedPost.id, {
      scheduled_at: newScheduledAt.toISOString(),
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Post rescheduled");
    }
    setDraggedPost(null);
  };

  const getModelLabel = (aiModel: string) => {
    const model = AI_MODELS.find((m) => m.id === aiModel);
    return model?.name.split(" / ")[0] || aiModel;
  };

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();

  const upcomingPosts = useMemo(() => {
    return filteredPosts
      .filter((p) => {
        if (p.status === "scheduled" && p.scheduled_at) {
          return parseISO(p.scheduled_at) >= new Date();
        }
        return p.status === "draft";
      })
      .sort((a, b) => {
        const dateA = a.scheduled_at ? parseISO(a.scheduled_at) : parseISO(a.created_at);
        const dateB = b.scheduled_at ? parseISO(b.scheduled_at) : parseISO(b.created_at);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 10);
  }, [filteredPosts]);

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Content Calendar</h1>
            <p className="text-muted-foreground">Schedule and manage your LinkedIn posts</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch
                id="show-drafts"
                checked={showDrafts}
                onCheckedChange={setShowDrafts}
              />
              <Label htmlFor="show-drafts" className="text-sm">Show Drafts</Label>
            </div>
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
            <Button
              variant="outline"
              onClick={() => {
                setEditingEvent(null);
                setEventDialogOpen(true);
              }}
            >
              <Flag className="w-4 h-4 mr-2" />
              Add Event
            </Button>
            <Button variant="hero" onClick={() => navigate("/app/create")}>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

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
                  const dayEvents = getEventsForDate(date);
                  const isToday = isSameDay(date, new Date());

                  return (
                    <div
                      key={index}
                      className={`min-h-[200px] rounded-lg border ${
                        isToday ? "border-primary bg-primary/5" : "border-border"
                      } p-3`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, date)}
                    >
                      <div className="text-center mb-3">
                        <p className="text-xs text-muted-foreground">{daysOfWeek[date.getDay()]}</p>
                        <p className={`text-lg font-semibold ${isToday ? "text-primary" : ""}`}>
                          {date.getDate()}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {/* Events */}
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => {
                              setEditingEvent(event);
                              setEventDialogOpen(true);
                            }}
                            className="p-2 rounded-md text-xs cursor-pointer transition-all hover:scale-[1.02] bg-accent/20 border border-accent/30"
                          >
                            <div className="flex items-center gap-1">
                              <Flag className="w-3 h-3" />
                              <p className="font-medium truncate">{event.title}</p>
                            </div>
                          </div>
                        ))}
                        {/* Posts */}
                        {dayPosts.map((post) => (
                          <div
                            key={post.id}
                            draggable={post.status === "scheduled"}
                            onDragStart={(e) => handleDragStart(e, post)}
                            onClick={() => setEditingPost(post)}
                            className={`p-2 rounded-md text-xs cursor-pointer transition-all hover:scale-[1.02] ${
                              post.status === "scheduled"
                                ? "bg-success/20 border border-success/30"
                                : "bg-warning/20 border border-warning/30"
                            }`}
                          >
                            <div className="flex items-start gap-1">
                              {post.status === "scheduled" && (
                                <GripVertical className="w-3 h-3 shrink-0 mt-0.5 cursor-grab" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">{post.content.slice(0, 40)}...</p>
                                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {post.scheduled_at
                                    ? format(parseISO(post.scheduled_at), "HH:mm")
                                    : "No time"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => navigate("/app/create")}
                          className="w-full p-2 rounded-md border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-xs text-muted-foreground"
                        >
                          <Plus className="w-3 h-3 mx-auto" />
                        </button>
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
                    const dayEvents = getEventsForDate(date);
                    const isToday = isSameDay(date, new Date());

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
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, date)}
                      >
                        <p className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                          {date.getDate()}
                        </p>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 1).map((event) => (
                            <div
                              key={event.id}
                              onClick={() => {
                                setEditingEvent(event);
                                setEventDialogOpen(true);
                              }}
                              className="p-1 rounded text-xs truncate bg-accent/20 cursor-pointer"
                            >
                              <Flag className="w-2 h-2 inline mr-1" />
                              {event.title}
                            </div>
                          ))}
                          {dayPosts.slice(0, 2).map((post) => (
                            <div
                              key={post.id}
                              onClick={() => setEditingPost(post)}
                              className={`p-1 rounded text-xs truncate cursor-pointer ${
                                post.status === "scheduled"
                                  ? "bg-success/20"
                                  : "bg-warning/20"
                              }`}
                            >
                              {post.content.slice(0, 25)}...
                            </div>
                          ))}
                          {(dayPosts.length > 2 || dayEvents.length > 1) && (
                            <p className="text-xs text-muted-foreground">
                              +{dayPosts.length + dayEvents.length - (dayPosts.slice(0, 2).length + dayEvents.slice(0, 1).length)} more
                            </p>
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

        {/* Upcoming Posts & Events */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No upcoming posts</p>
                  <Button variant="link" onClick={() => navigate("/app/create")}>
                    Create your first post
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <CalendarIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{post.content.slice(0, 50)}...</p>
                          <p className="text-sm text-muted-foreground">
                            {post.scheduled_at
                              ? format(parseISO(post.scheduled_at), "MMM d, yyyy 'at' h:mm a")
                              : "Draft - " + format(parseISO(post.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={post.status === "scheduled" ? "default" : "secondary"}>
                          {post.status}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => setEditingPost(post)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Planning Events</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingEvent(null);
                  setEventDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Flag className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No planning events</p>
                  <p className="text-sm mt-1">Add events to plan your content around</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => {
                        setEditingEvent(event);
                        setEventDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <Flag className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(event.event_date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{event.event_type.replace("_", " ")}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Post Dialog */}
      <EditPostDialog
        post={editingPost}
        open={!!editingPost}
        onOpenChange={(open) => !open && setEditingPost(null)}
        onSave={handlePostUpdate}
        onDelete={handlePostDelete}
        onRetry={async (id) => {
          const result = await updatePost(id, { status: "scheduled", error_message: null, retry_count: 0 });
          if (!result.error) toast.success("Post queued for retry");
          return result;
        }}
      />

      {/* Event Dialog */}
      <EventDialog
        event={editingEvent}
        open={eventDialogOpen}
        onOpenChange={(open) => {
          setEventDialogOpen(open);
          if (!open) setEditingEvent(null);
        }}
        onSave={handleEventSave}
        onDelete={editingEvent ? handleEventDelete : undefined}
      />
    </AppLayout>
  );
};

export default ContentCalendar;
