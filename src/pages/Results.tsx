import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WavyBackground } from "@/components/WavyBackground";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

type Result = { tone: string; probs: Record<string, number> };

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Prefer image passed via navigate(..., { state: { image } }), fallback to sessionStorage preview
  const [image, setImage] = useState<string | null>(location.state?.image ?? null);
  const [data, setData] = useState<Result | null>(null);

  useEffect(() => {
    if (!image) {
      const prev = sessionStorage.getItem("uploadedImagePreview");
      if (prev) setImage(prev);
    }
    const raw = sessionStorage.getItem("skinToneResult");
    if (raw) setData(JSON.parse(raw));
  }, []);

  // Derive display fields
  const { detectedTone, confidencePct, topLabelPctList } = useMemo(() => {
    if (!data) return { detectedTone: null as string | null, confidencePct: 0, topLabelPctList: [] as Array<[string, number]> };
    const entries = Object.entries(data.probs).sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    const pctList = entries.slice(0, 6).map(([k, v]) => [k, v * 100] as [string, number]);
    return {
      detectedTone: data.tone || (top ? top[0] : null),
      confidencePct: top ? Math.round(top[1] * 100) : 0,
      topLabelPctList: pctList,
    };
  }, [data]);

  // Optional: If you later add gender/undertone from backend, set them here.
  const gender = undefined;           // e.g., "Female"
  const undertone = undefined;        // e.g., "Warm"

  function goToPalette() {
    if (detectedTone) sessionStorage.setItem("predictedTone", detectedTone);
    navigate("/palette");
  }

  if (!data) {
    return (
      <main className="container mx-auto px-6 pt-32 md:pt-40 pb-24">
        <div className="text-center text-[#7b695f]">
          No result yet. Please upload a photo from Home.
        </div>
      </main>
    );
  }

  return (
    <div className="relative min-h-screen p-6">
      <WavyBackground />

      <div className="container max-w-6xl mx-auto">
        <Button onClick={() => navigate("/home")} variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-8 items-center"
        >
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-square rounded-full overflow-hidden shadow-2xl border-4 border-accent/30">
              {image ? (
                <img src={image} alt="Analyzed" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                  <p className="text-muted-foreground">No image</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right - Results (live values) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-8"
          >
            <div>
              <motion.h1
                className="text-5xl font-bold text-foreground mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {detectedTone ?? "Unknown"}
              </motion.h1>

              <motion.p
                className="text-2xl text-muted-foreground mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {undertone ? `${undertone} Undertone` : "Predicted Tone"}
              </motion.p>

              {(gender || undertone) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                  {gender && <Badge variant="secondary" className="text-sm px-4 py-2">{gender}</Badge>}
                </motion.div>
              )}
            </div>

            {/* Confidence bar */}
            <motion.div
              className="p-6 bg-accent/20 rounded-2xl border border-border/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Analysis Confidence</span>
                <span className="text-lg font-bold text-foreground">{confidencePct}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${confidencePct}%` }}
                  transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </motion.div>

            {/* Top probabilities list */}
            <div className="rounded-2xl bg-white shadow p-6 ring-1 ring-black/5">
              {topLabelPctList.map(([label, pct]) => (
                <div key={label} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#3e2b22]">{label}</span>
                    <span className="text-[#8b7769]">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full rounded bg-[#f0e8df] overflow-hidden">
                    <div className="h-full rounded bg-[#CDB099]" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
              <Button onClick={goToPalette} size="lg" className="w-full rounded-full text-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                View Color Suggestions
              </Button>

              <Button onClick={() => navigate("/home")} variant="outline" size="lg" className="w-full rounded-full">
                Upload New Image
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
