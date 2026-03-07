import React from "react";
import { motion } from "framer-motion";

export default function TranscriptBubble({ text, isLatest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-xl max-w-[85%] ${
        isLatest
          ? "bg-secondary border border-border text-foreground"
          : "bg-muted/50 text-muted-foreground"
      }`}
    >
      <p className="text-sm leading-relaxed">{text}</p>
    </motion.div>
  );
}
