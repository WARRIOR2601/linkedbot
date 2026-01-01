import { useState, useEffect } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AI_MODELS } from "@/lib/ai-models";
import { Post } from "@/hooks/usePosts";

interface EditPostDialogProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Post>) => Promise<{ error: string | null }>;
  onDelete: (id: string) => Promise<{ error: string | null }>;
}

const TIME_SLOTS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00",
];

export function EditPostDialog({
  post,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: EditPostDialogProps) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "scheduled">("draft");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setStatus(post.status);
      if (post.scheduled_at) {
        const date = new Date(post.scheduled_at);
        setSelectedDate(date);
        setSelectedTime(format(date, "HH:mm"));
      } else {
        setSelectedDate(undefined);
        setSelectedTime("09:00");
      }
    }
  }, [post]);

  const handleSave = async () => {
    if (!post) return;

    setIsSaving(true);

    let scheduledAt: string | null = null;
    if (status === "scheduled" && selectedDate) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const date = new Date(selectedDate);
      date.setHours(hours, minutes, 0, 0);
      scheduledAt = date.toISOString();
    }

    const { error } = await onSave(post.id, {
      content,
      status,
      scheduled_at: scheduledAt,
    });

    setIsSaving(false);
    if (!error) {
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    setIsDeleting(true);
    const { error } = await onDelete(post.id);
    setIsDeleting(false);
    if (!error) {
      onOpenChange(false);
    }
  };

  const handleRevertToDraft = async () => {
    if (!post) return;

    setIsSaving(true);
    const { error } = await onSave(post.id, {
      status: "draft",
      scheduled_at: null,
    });
    setIsSaving(false);
    if (!error) {
      setStatus("draft");
      setSelectedDate(undefined);
    }
  };

  const isValidSchedule = () => {
    if (status !== "scheduled") return true;
    if (!selectedDate) return false;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    return !isBefore(scheduledAt, new Date());
  };

  const modelInfo = AI_MODELS.find((m) => m.id === post?.ai_model);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Modify your post content and scheduling.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Post metadata */}
          <div className="flex flex-wrap gap-2">
            {modelInfo && (
              <Badge variant="outline">{modelInfo.name}</Badge>
            )}
            {post?.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          {/* Hashtags */}
          {post?.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.hashtags.map((tag) => (
                <span key={tag} className="text-sm text-primary">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as "draft" | "scheduled")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Schedule options */}
          {status === "scheduled" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => isBefore(date, startOfDay(new Date()))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="w-full">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {status === "scheduled" && selectedDate && !isValidSchedule() && (
            <p className="text-sm text-destructive">
              Please select a time in the future.
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
            className="sm:mr-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
          
          {post?.status === "scheduled" && (
            <Button
              variant="outline"
              onClick={handleRevertToDraft}
              disabled={isSaving || isDeleting}
            >
              Revert to Draft
            </Button>
          )}
          
          <Button
            onClick={handleSave}
            disabled={!isValidSchedule() || isSaving || isDeleting || !content.trim()}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
