import React from "react";
import { format } from "date-fns";
import { Heart, Briefcase, Coffee, Users, Clock, MessageSquare, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const typeIcons = {
  date: Heart,
  networking: Briefcase,
  casual: Coffee,
  interview: Users,
  presentation: MessageSquare,
  other: MessageSquare,
};

const typeColors = {
  date: "text-rose-400 bg-rose-500/10",
  networking: "text-blue-400 bg-blue-500/10",
  casual: "text-amber-400 bg-amber-500/10",
  interview: "text-purple-400 bg-purple-500/10",
  presentation: "text-green-400 bg-green-500/10",
  other: "text-muted-foreground bg-muted",
};

export default function RecentSessionCard({ session }) {
  const Icon = typeIcons[session.session_type] || MessageSquare;
  const colors = typeColors[session.session_type] || typeColors.other;

  const formatDuration = (seconds) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  return (
    <Link
      to={createPageUrl("SessionHistory") + `?id=${session.id}`}
      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-all group"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{session.title}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground">
            {format(new Date(session.created_date), "MMM d")}
          </span>
          {session.duration_seconds && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(session.duration_seconds)}
            </span>
          )}
          {session.tips_given?.length > 0 && (
            <span className="text-xs text-primary">
              {session.tips_given.length} tips
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </Link>
  );
}
