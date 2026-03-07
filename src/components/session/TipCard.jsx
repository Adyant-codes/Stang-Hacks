import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, MessageCircle, AlertTriangle, Heart } from "lucide-react";

const categoryConfig = {
  suggestion: { icon: Lightbulb, color: "border-primary/30 bg-primary/5", iconColor: "text-primary" },
  conversation: { icon: MessageCircle, color: "border-blue-500/30 bg-blue-500/5", iconColor: "text-blue-400" },
  warning: { icon: AlertTriangle, color: "border-amber-500/30 bg-amber-500/5", iconColor: "text-amber-400" },
  empathy: { icon: Heart, color: "border-rose-500/30 bg-rose-500/5", iconColor: "text-rose-400" },
};

export default function TipCard({ tip, index }) {
  const config = categoryConfig[tip.category] || categoryConfig.suggestion;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`p-4 rounded-xl border ${config.color} backdrop-blur-sm`}
    >
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-relaxed">{tip.tip}</p>
          {tip.timestamp && (
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">{tip.timestamp}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
