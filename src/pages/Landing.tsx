import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";

const LOGO = `${import.meta.env.BASE_URL}images/logo-bg.png`;
const RACK = `${import.meta.env.BASE_URL}images/clothes-bg.png`;

export default function Landing() {
  const navigate = useNavigate();

  return (
    // ↓ pushed down a bit more so the text sits comfortably below the wave
    <div className="container mx-auto px-6 pt-28 md:pt-36 pb-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT — Brand / Text / CTA */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <img src={LOGO} alt="ChromaTone Logo" className="w-14 h-14 drop-shadow" />
            <h1
              className="tracking-tight text-[clamp(40px,7vw,82px)] leading-none"
              style={{ fontFamily: "'Dancing Script', cursive", color: "#8C4B2F" }}
            >
              ChromaTone
            </h1>
          </div>

          <p className="text-lg md:text-xl text-[#725a4d] max-w-xl mx-auto lg:mx-0">
            Discover outfit colors that flatter your unique skin tone. Calm,
            elegant styling — personalized for you.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-6"
          >
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl bg-[#A5673F] hover:bg-[#6f351f] transition-all"
            >
              Get Started
              <motion.span
                className="ml-2 inline-flex"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <TrendingUp className="w-5 h-5" />
              </motion.span>
            </Button>
          </motion.div>

          <p className="text-sm text-[#8b7769] mt-4">
            AI-powered color analysis • Instant recommendations
          </p>
        </motion.div>

        {/* RIGHT — Clothes Visual */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="hidden lg:flex items-center justify-center"
        >
          <img
            src={RACK}
            alt="Clothing Rack"
            className="w-full max-w-[450px] rounded-3xl shadow-2xl opacity-95 translate-x-6"
          />
        </motion.div>
      </div>
    </div>
  );
}
