import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WavyBackground } from "@/components/WavyBackground";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Download, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { skintoneColorPalettes, availableUndertones } from "@/data/paletteData";

const ColorSwatch = ({ color, index }: { color: { name: string; hex: string }; index: number }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    toast({
      title: "Copied!",
      description: `${color.hex} copied to clipboard`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="group relative cursor-pointer"
      onClick={handleCopy}
    >
      <div
        className="w-full aspect-square rounded-full shadow-lg border-2 border-background transition-all duration-300 group-hover:shadow-xl"
        style={{ backgroundColor: color.hex }}
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-background/95 rounded-full p-3 shadow-lg">
          {copied ? (
            <Check className="w-5 h-5 text-primary" />
          ) : (
            <Copy className="w-5 h-5 text-foreground" />
          )}
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-foreground">{color.name}</p>
        <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
      </div>
    </motion.div>
  );
};

const Palette = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Default Example Values
  const [selectedTone] = useState("Caramel");
  const [selectedUndertone, setSelectedUndertone] = useState("Warm");
  
  const currentPalette = skintoneColorPalettes[selectedTone]?.[selectedUndertone] 
    || skintoneColorPalettes["Caramel"]["Warm"];

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#F5F1E8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#2D2D2D';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(`${selectedTone} - ${selectedUndertone} Undertone`, 40, 60);
      
      const drawColors = (colors: typeof currentPalette.upper, startY: number, label: string) => {
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(label, 40, startY);
        
        colors.forEach((color, index) => {
          const x = 40 + (index % 6) * 190;
          const y = startY + 30 + Math.floor(index / 6) * 100;
          
          ctx.fillStyle = color.hex;
          ctx.fillRect(x, y, 160, 60);
          
          ctx.fillStyle = '#2D2D2D';
          ctx.font = '12px sans-serif';
          ctx.fillText(color.name, x, y + 80);
          ctx.fillText(color.hex, x, y + 95);
        });
      };
      
      drawColors(currentPalette.upper, 100, 'Upper Wear');
      drawColors(currentPalette.lower, 380, 'Lower Wear');
      
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.download = `ChromaTone-${selectedTone}-${selectedUndertone}.png`;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Download complete!",
            description: "Your color palette has been saved",
          });
        }
      });
    }
  };

  return (
    <div className="relative min-h-screen p-6">
      <WavyBackground />

      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button onClick={() => navigate("/results")} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>

          <Button onClick={handleDownload} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Palette
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Your Color Recommendations
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Click any color to copy its HEX code
          </p>

          <div className="flex justify-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
              <span className="text-sm font-medium text-muted-foreground">Undertone:</span>
              {availableUndertones.map((undertone) => (
                <Button
                  key={undertone}
                  onClick={() => setSelectedUndertone(undertone)}
                  variant={selectedUndertone === undertone ? "default" : "ghost"}
                  size="sm"
                  className="rounded-full"
                >
                  {undertone}
                </Button>
              ))}
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm rounded-full px-6 py-2 border border-primary/20">
            <span className="text-sm font-semibold text-primary">{selectedTone}</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{selectedUndertone} Undertone</span>
          </div>
        </motion.div>

        <Tabs defaultValue="upper" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 h-auto p-2">
            <TabsTrigger value="upper" className="text-sm md:text-base py-3">
              Upper Wear
            </TabsTrigger>
            <TabsTrigger value="lower" className="text-sm md:text-base py-3">
              Lower Wear
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upper" className="mt-8">
            <div className="grid grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              {currentPalette.upper.map((color, index) => (
                <ColorSwatch key={color.hex} color={color} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lower" className="mt-8">
            <div className="grid grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              {currentPalette.lower.map((color, index) => (
                <ColorSwatch key={color.hex} color={color} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Button
            onClick={() => navigate("/home")}
            size="lg"
            variant="outline"
            className="rounded-full"
          >
            Upload New Image
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Palette;
