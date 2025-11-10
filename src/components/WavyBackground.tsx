import { motion } from "framer-motion";

export const WavyBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Wavy shapes */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(30 50% 85%) 0%, transparent 70%)",
        }}
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/3 -right-20 w-80 h-80 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, hsl(25 55% 80%) 0%, transparent 70%)",
        }}
        animate={{
          y: [0, -40, 0],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-1/4 w-72 h-72 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, hsl(35 40% 88%) 0%, transparent 70%)",
        }}
        animate={{
          y: [0, 25, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};
