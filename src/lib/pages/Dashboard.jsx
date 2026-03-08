import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Radio, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import QuickStartCard from "../components/dashboard/QuickStartCard";
import StatsOverview from "../components/dashboard/StatsOverview";
import RecentSessionCard from "../components/dashboard/RecentSessionCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => base44.entities.Session.list("-created_date", 20),
  });

  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-border/50 p-8"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69aca1034cff89ae94a820bb/2dc72f8d6_generated_image.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-primary pulse-ring" />
            <span className="text-xs text-primary font-medium uppercase tracking-wider">Ready to assist</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Your social<br />
            <span className="text-primary">wingman</span> awaits
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Get real-time conversation tips powered by AI. Never feel stuck in a conversation again.
          </p>
          <Link to={createPageUrl("SessionSetup")}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 gap-2">
              <Radio className="w-4 h-4" />
              Start Live Session
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-card" />
          ))}
        </div>
      ) : (
        <StatsOverview sessions={sessions} />
      )}

      {/* Quick Start */}
      <QuickStartCard />

      {/* Recent Sessions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Sessions</h2>
          {sessions.length > 0 && (
            <Link to={createPageUrl("SessionHistory")} className="text-xs text-primary hover:underline">
              View all
            </Link>
          )}
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 rounded-xl bg-card" />
            ))}
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="space-y-2">
            {recentSessions.map(session => (
              <RecentSessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl bg-card border border-border/50">
            <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No sessions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start your first session to see activity here</p>
          </div>
        )}
      </div>
    </div>
  );
}
