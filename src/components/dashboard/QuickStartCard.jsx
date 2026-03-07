import React from "react";
import { motion } from "framer-motion";
import { Heart, Briefcase, Coffee, Mic, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const sessionTypes = [
  { type: "date", label: "Date", icon: Heart, color: "from-rose-500/20 to-pink-500/20", iconColor: "text-rose-400" },
  { type: "networking", label: "Networking", icon: Briefcase, color: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-400" },
  { type: "casual", label: "Casual", icon: Coffee, color: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-400" },
  { type: "interview", label: "Interview", icon: Users, color: "from-purple-500/20 to-violet-500/20", iconColor: "text-purple-400" },
];

export default function QuickStartCard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Start</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {sessionTypes.map((item, i) => (
          <motion.div
            key={item.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={createPageUrl("SessionSetup") + `?type=${item.type}`}
              className={`block p-5 rounded-2xl bg-gradient-to-br ${item.color} border border-border/50 hover:border-border transition-all duration-300 hover:scale-[1.02] group`}
            >
              <item.icon className={`w-6 h-6 ${item.iconColor} mb-3 group-hover:scale-110 transition-transform`} />
              <p className="font-semibold text-foreground text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">Start session</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
