import { useState, useEffect } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { UpcomingEvent } from "@/hooks/useUpcomingEvents";

interface EventDialogProps {
  event?: UpcomingEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; description: string | null; event_date: string; event_type: string }) => Promise<{ error: string | null }>;
  onDelete?: (id: string) => Promise<{ error: string | null }>;
}

const EVENT_TYPES = [
  { value: "product_launch", label: "Product Launch" },
  { value: "hiring", label: "Hiring Drive" },
  { value: "webinar", label: "Webinar" },
  { value: "milestone", label: "Company Milestone" },
  { value: "conference", label: "Conference" },
  { value: "general", label: "General" },
];

export function EventDialog({
  event,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [eventType, setEventType] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditMode = !!event;

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setSelectedDate(new Date(event.event_date));
      setEventType(event.event_type);
    } else {
      setTitle("");
      setDescription("");
      setSelectedDate(undefined);
      setEventType("general");
    }
  }, [event, open]);

  const handleSave = async () => {
    if (!title.trim() || !selectedDate) return;

    setIsSaving(true);
    const { error } = await onSave({
      title: title.trim(),
      description: description.trim() || null,
      event_date: format(selectedDate, "yyyy-MM-dd"),
      event_type: eventType,
    });

    setIsSaving(false);
    if (!error) {
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !onDelete) return;

    setIsDeleting(true);
    const { error } = await onDelete(event.id);
    setIsDeleting(false);
    if (!error) {
      onOpenChange(false);
    }
  };

  const isValid = title.trim() && selectedDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Event" : "Add Event"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your planning event details."
              : "Add an upcoming event to help plan your content."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Event Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Product Launch, Webinar"
            />
          </div>

          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Label>Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any notes about this event..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isEditMode && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="sm:mr-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || isSaving || isDeleting}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Add Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
