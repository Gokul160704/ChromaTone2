import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WavyBackground } from "@/components/WavyBackground";
import { Upload, Camera, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { predictSkinTone } from "@/lib/api";

const Home = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // preview (data URL)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);      // actual file for backend
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImageSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (JPG, PNG)",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      toast({ title: "Analyzing...", description: "Processing your image" });

      // ⤵️ Call your Flask API
      const result = await predictSkinTone(selectedFile);

      // Save for Results page
      sessionStorage.setItem("skinToneResult", JSON.stringify(result));
      if (selectedImage) sessionStorage.setItem("uploadedImagePreview", selectedImage);
      sessionStorage.setItem("uploadedImageName", selectedFile.name);

      navigate("/results");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Prediction failed",
        description:
          err?.message || "Could not connect to the backend. Is it running on 127.0.0.1:5000?",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <WavyBackground />

      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-5xl font-bold text-foreground">ChromaTone</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Upload your photo to discover your perfect color palette
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-card rounded-3xl shadow-2xl p-8 border border-border/50 backdrop-blur-sm"
        >
          {!selectedImage ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-accent/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="text-center space-y-6">
                <motion.div
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/50 mb-4"
                  animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: isDragging ? Infinity : 0, duration: 1 }}
                >
                  <Upload className="w-12 h-12 text-primary" />
                </motion.div>

                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    Drag & Drop Your Photo
                  </h3>
                  <p className="text-muted-foreground">or click to browse files</p>
                </div>

                <div className="flex gap-4 justify-center flex-wrap">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                    variant="default"
                    className="rounded-full"
                    disabled={uploading}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {uploading ? "Analyzing..." : "Upload Photo"}
                  </Button>

                  <Button
                    onClick={() =>
                      toast({
                        title: "Webcam feature",
                        description: "Webcam capture coming soon!",
                      })
                    }
                    size="lg"
                    variant="outline"
                    className="rounded-full"
                    disabled={uploading}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Use Webcam
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Supported formats: JPG, PNG • Max size: 6MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden shadow-lg">
                <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={handleAnalyze}
                  size="lg"
                  className="rounded-full px-8"
                  disabled={uploading}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {uploading ? "Analyzing..." : "Analyze Photo"}
                </Button>

                <Button
                  onClick={() => {
                    setSelectedImage(null);
                    setSelectedFile(null);
                  }}
                  size="lg"
                  variant="outline"
                  className="rounded-full"
                  disabled={uploading}
                >
                  Choose Different Photo
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
