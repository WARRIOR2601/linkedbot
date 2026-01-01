import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAgents, useAgentTraining, useAgentPosts, AGENT_TYPES } from "@/hooks/useAgents";
import {
  Bot,
  ArrowLeft,
  Play,
  Pause,
  Trash2,
  FileText,
  Brain,
  Plus,
  Clock,
  MessageSquare,
  Image,
} from "lucide-react";
import { format, parseISO } from "date-fns";

const TRAINING_TYPES = [
  { id: "sample_post", name: "Sample Post", description: "Example LinkedIn post in your style" },
  { id: "company_info", name: "Company Info", description: "About your company or product" },
  { id: "personal_bio", name: "Personal Bio", description: "Your role and background" },
  { id: "writing_style", name: "Writing Style", description: "Tone and voice preferences" },
  { id: "topic_context", name: "Topic Context", description: "Context about specific topics" },
];

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { agents, isLoading, updateAgent, toggleAgentStatus, deleteAgent } = useAgents();
  const { trainingData, addTrainingData, deleteTrainingData } = useAgentTraining(id || null);
  const { posts } = useAgentPosts(id || null);

  const [newTrainingType, setNewTrainingType] = useState("sample_post");
  const [newTrainingContent, setNewTrainingContent] = useState("");
  const [isAddingTraining, setIsAddingTraining] = useState(false);

  const agent = agents.find((a) => a.id === id);

  const handleAddTraining = async () => {
    if (!id || !newTrainingContent.trim()) return;

    await addTrainingData.mutateAsync({
      agent_id: id,
      training_type: newTrainingType,
      content: newTrainingContent.trim(),
    });

    setNewTrainingContent("");
    setIsAddingTraining(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteAgent.mutateAsync(id);
    navigate("/app/agents");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  if (!agent) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Agent Not Found</h2>
          <p className="text-muted-foreground mb-4">This agent doesn't exist or was deleted.</p>
          <Button onClick={() => navigate("/app/agents")}>Back to Agents</Button>
        </div>
      </AppLayout>
    );
  }

  const getAgentTypeName = (type: string) => {
    return AGENT_TYPES.find((t) => t.id === type)?.name || type;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app/agents")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                <p className="text-muted-foreground">{getAgentTypeName(agent.agent_type)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={agent.status === "active" ? "outline" : "default"}
              onClick={() =>
                toggleAgentStatus.mutate({
                  id: agent.id,
                  status: agent.status === "active" ? "paused" : "active",
                })
              }
            >
              {agent.status === "active" ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Agent
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Agent
                </>
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{agent.name}" and all its training data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Status Banner */}
        <Card className={agent.status === "active" ? "border-success/50 bg-success/5" : "border-warning/50 bg-warning/5"}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {agent.status === "active" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="font-medium text-success">Agent is active</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  <span className="font-medium text-warning">Agent is {agent.status}</span>
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {agent.posts_created} posts created
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="training" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="training">
              <Brain className="w-4 h-4 mr-2" />
              Training
            </TabsTrigger>
            <TabsTrigger value="posts">
              <FileText className="w-4 h-4 mr-2" />
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Training Data</CardTitle>
                  <CardDescription>
                    Add sample posts and context to train this agent
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddingTraining(true)} disabled={isAddingTraining}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Training
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAddingTraining && (
                  <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                    <div className="space-y-2">
                      <Label>Training Type</Label>
                      <Select value={newTrainingType} onValueChange={setNewTrainingType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TRAINING_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        placeholder={
                          newTrainingType === "sample_post"
                            ? "Paste a sample LinkedIn post you've written..."
                            : "Add relevant information..."
                        }
                        value={newTrainingContent}
                        onChange={(e) => setNewTrainingContent(e.target.value)}
                        className="min-h-[150px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingTraining(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddTraining}
                        disabled={!newTrainingContent.trim() || addTrainingData.isPending}
                      >
                        {addTrainingData.isPending ? "Adding..." : "Add Training Data"}
                      </Button>
                    </div>
                  </div>
                )}

                {trainingData.length === 0 && !isAddingTraining ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No training data yet</p>
                    <p className="text-sm">Add sample posts and context to improve this agent's writing</p>
                  </div>
                ) : (
                  trainingData.map((data) => (
                    <div key={data.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">
                          {TRAINING_TYPES.find((t) => t.id === data.training_type)?.name || data.training_type}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive h-6 px-2"
                          onClick={() => deleteTrainingData.mutate(data.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{data.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Added {format(parseISO(data.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Posts by {agent.name}</CardTitle>
                <CardDescription>
                  All posts created by this agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No posts created yet</p>
                    <p className="text-sm">Start the agent to begin autonomous posting</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <Badge
                            variant={
                              post.status === "posted"
                                ? "default"
                                : post.status === "scheduled"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {post.status}
                          </Badge>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(parseISO(post.created_at), "MMM d, h:mm a")}
                          </div>
                        </div>
                        <p className="text-sm line-clamp-3">{post.content}</p>
                        {post.image_url && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Image className="w-3 h-3" />
                            Has image
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Settings</CardTitle>
                <CardDescription>Configure agent behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Posting Frequency</Label>
                    <p className="text-sm capitalize">{agent.posting_frequency}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Window</Label>
                    <p className="text-sm">
                      {agent.preferred_time_window_start} - {agent.preferred_time_window_end}
                    </p>
                  </div>
                </div>
                {agent.posting_goal && (
                  <div className="space-y-2">
                    <Label>Posting Goal</Label>
                    <p className="text-sm text-muted-foreground">{agent.posting_goal}</p>
                  </div>
                )}
                {agent.tone_of_voice && (
                  <div className="space-y-2">
                    <Label>Tone of Voice</Label>
                    <p className="text-sm text-muted-foreground">{agent.tone_of_voice}</p>
                  </div>
                )}
                {agent.topics && agent.topics.length > 0 && (
                  <div className="space-y-2">
                    <Label>Topics</Label>
                    <div className="flex flex-wrap gap-2">
                      {agent.topics.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AgentDetail;
