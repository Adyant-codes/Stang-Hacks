import React from "react";
import { motion } from "framer-motion";
import { Zap, Clock, MessageSquare, TrendingUp } from "lucide-react";

export default function StatsOverview({ sessions }) {
  const totalSessions = sessions.length;
  const totalTips = sessions.reduce((acc, s) => acc + (s.tips_given?.length || 0), 0);
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60);
  
  const stats = [
    { label: "Sessions", value: totalSessions, icon: Zap, color: "text-primary" },
    { label: "Tips Given", value: totalTips, icon: MessageSquare, color: "text-blue-400" },
    { label: "Minutes", value: totalMinutes, icon: Clock, color: "text-green-400" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 rounded-2xl bg-card border border-border/50 text-center"
        >
          <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-2`} />
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
