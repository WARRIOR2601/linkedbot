import { useState } from "react";
import { format } from "date-fns";
import { useAITraining, AITrainingUpdate } from "@/hooks/useAITraining";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Brain, Plus, Trash2, Clock, Lightbulb, Target, Megaphone, Building2 } from "lucide-react";

const UPDATE_TYPES = [
  { id: "general", name: "General Update", icon: Lightbulb, description: "General business or content updates" },
  { id: "tone", name: "Tone Direction", icon: Megaphone, description: "Adjust voice and communication style" },
  { id: "focus", name: "Focus Areas", icon: Target, description: "New topics or themes to emphasize" },
  { id: "business", name: "Business Update", icon: Building2, description: "Company news, products, or milestones" },
] as const;

const TrainAI = () => {
  const { updates, isLoading, lastTrainedAt, addUpdate, deleteUpdate } = useAITraining();
  const [newContent, setNewContent] = useState("");
  const [updateType, setUpdateType] = useState<AITrainingUpdate["update_type"]>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newContent.trim()) {
      toast.error("Please enter some content");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await addUpdate(newContent.trim(), updateType);
      if (error) throw new Error(error);
      
      setNewContent("");
      toast.success("AI training updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add training update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteUpdate(id);
    if (error) {
      toast.error("Failed to delete update");
    } else {
      toast.success("Update deleted");
    }
  };

  const getTypeIcon = (type: string) => {
    const found = UPDATE_TYPES.find(t => t.id === type);
    return found?.icon || Lightbulb;
  };

  const getTypeName = (type: string) => {
    const found = UPDATE_TYPES.find(t => t.id === type);
    return found?.name || "General";
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              Train AI
            </h1>
            <p className="text-muted-foreground mt-1">
              Continuously improve AI-generated content with your updates
            </p>
          </div>
          {lastTrainedAt && (
            <Badge variant="outline" className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Last trained: {format(new Date(lastTrainedAt), "MMM d, yyyy")}
            </Badge>
          )}
        </div>

        {/* Add New Training Update */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Training Update</CardTitle>
            <CardDescription>
              Help AI understand your business better by adding context and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Update Type</Label>
                <Select 
                  value={updateType} 
                  onValueChange={(v) => setUpdateType(v as AITrainingUpdate["update_type"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UPDATE_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <p className="text-sm text-muted-foreground">
                  {UPDATE_TYPES.find(t => t.id === updateType)?.description}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="E.g., 'We just launched a new AI feature that helps customers save 50% time on their workflows. Our tone should be more excited and forward-thinking when discussing AI topics.'"
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Be specific and detailed. The AI will use this to improve future content generation.
              </p>
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting || !newContent.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? "Adding..." : "Add Training Update"}
            </Button>
          </CardContent>
        </Card>

        {/* Training History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Training History</CardTitle>
            <CardDescription>
              All updates that enhance AI understanding of your brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : updates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No training updates yet</p>
                <p className="text-sm mt-1">Add your first update above to improve AI content</p>
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => {
                  const TypeIcon = getTypeIcon(update.update_type);
                  return (
                    <div
                      key={update.id}
                      className="flex gap-4 p-4 rounded-lg border border-border bg-card/50"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 h-fit">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {getTypeName(update.update_type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(update.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                          {update.content}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete training update?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove this update from AI training context. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(update.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TrainAI;
