import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  ImagePlus, 
  Wand2, 
  Upload, 
  X, 
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PostImageUploadProps {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  postContent?: string;
  tags?: string[];
}

const PostImageUpload = ({ 
  imageUrl, 
  onImageChange, 
  postContent = "", 
  tags = [] 
}: PostImageUploadProps) => {
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const generateImage = async () => {
    if (!session?.access_token) {
      toast.error("Please log in to generate images");
      return;
    }

    if (!postContent) {
      toast.error("Generate post content first to create a matching image");
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Professional LinkedIn post image for: ${postContent.slice(0, 200)}. ${tags.length > 0 ? `Related to: ${tags.join(", ")}.` : ""} Clean, modern, professional design suitable for business social media.`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ prompt }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      onImageChange(data.imageUrl);
      toast.success("Image generated successfully!");
    } catch (error: any) {
      console.error("Image generation error:", error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onImageChange(base64);
        toast.success("Image uploaded successfully!");
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Post Image (Optional)
          </Label>
          {imageUrl && (
            <Button variant="ghost" size="sm" onClick={removeImage}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {imageUrl ? (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
              <img
                src={imageUrl}
                alt="Post preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateImage}
                disabled={isGenerating || !postContent}
                className="flex-1"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Replace
              </Button>
            </div>
          </div>
        ) : isGenerating || isUploading ? (
          <div className="space-y-3">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <p className="text-center text-sm text-muted-foreground">
              {isGenerating ? "Generating image..." : "Uploading..."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={generateImage}
              disabled={!postContent}
              className="h-24 flex-col gap-2"
            >
              <Wand2 className="w-6 h-6 text-primary" />
              <span className="text-xs">AI Generate</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-24 flex-col gap-2"
            >
              <ImagePlus className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs">Upload Image</span>
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />

        {!postContent && !imageUrl && (
          <p className="text-xs text-muted-foreground text-center">
            Generate post content first to enable AI image generation
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PostImageUpload;
