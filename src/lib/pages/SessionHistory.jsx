import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Heart, Briefcase, Coffee, Users, MessageSquare, Clock, Lightbulb, ChevronLeft, ArrowLeft, X, FileText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import TipCard from "../components/session/TipCard";

const typeIcons = {
  date: Heart, networking: Briefcase, casual: Coffee, interview: Users,
  presentation: MessageSquare, other: MessageSquare,
};
const typeColors = {
  date: "text-rose-400 bg-rose-500/10",
  networking: "text-blue-400 bg-blue-500/10",
  casual: "text-amber-400 bg-amber-500/10",
  interview: "text-purple-400 bg-purple-500/10",
  presentation: "text-green-400 bg-green-500/10",
  other: "text-muted-foreground bg-muted",
};

export default function SessionHistory() {
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedId = urlParams.get("id");
  const [selectedId, setSelectedId] = useState(preSelectedId || null);
  const navigate = useNavigate();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions-history"],
    queryFn: () => base44.entities.Session.list("-created_date", 50),
  });

  const selectedSession = sessions.find(s => s.id === selectedId);

  useEffect(() => {
    if (preSelectedId && !selectedId) setSelectedId(preSelectedId);
  }, [preSelectedId]);

  const formatDuration = (seconds) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleDelete = async (session) => {
    if (window.confirm("Delete this session?")) {
      await base44.entities.Session.delete(session.id);
      setSelectedId(null);
      window.location.reload();
    }
  };

  if (selectedSession) {
    const Icon = typeIcons[selectedSession.session_type] || MessageSquare;
    const colors = typeColors[selectedSession.session_type] || typeColors.other;

    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{selectedSession.title}</h1>
            <p className="text-xs text-muted-foreground">
              {format(new Date(selectedSession.created_date), "MMM d, yyyy • h:mm a")}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(selectedSession)} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Session Info */}
        <div className="flex flex-wrap gap-2">
          <Badge className={`${colors} border-0`}>
            <Icon className="w-3 h-3 mr-1" />
            {selectedSession.session_type}
          </Badge>
          {selectedSession.contact_name && (
            <Badge variant="outline" className="border-border">
              {selectedSession.contact_name}
            </Badge>
          )}
          <Badge variant="outline" className="border-border">
            <Clock className="w-3 h-3 mr-1" />
            {formatDuration(selectedSession.duration_seconds)}
          </Badge>
          {selectedSession.tips_given && (
            <Badge variant="outline" className="border-border">
              <Lightbulb className="w-3 h-3 mr-1" />
              {selectedSession.tips_given.length} tips
            </Badge>
          )}
        </div>

        {/* Context */}
        {selectedSession.context_notes && (
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Context Provided</p>
            <p className="text-sm text-secondary-foreground whitespace-pre-wrap">{selectedSession.context_notes}</p>
          </div>
        )}

        {/* Transcript */}
        {selectedSession.transcript && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
              <FileText className="w-3 h-3" /> Transcript
            </p>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <p className="text-sm text-secondary-foreground whitespace-pre-wrap leading-relaxed">{selectedSession.transcript}</p>
            </div>
          </div>
        )}

        {/* Tips */}
        {selectedSession.tips_given?.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
              <Lightbulb className="w-3 h-3 text-primary" /> Tips Given
            </p>
            {selectedSession.tips_given.map((tip, i) => (
              <TipCard key={i} tip={tip} index={i} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Session History</h1>
        <p className="text-xs text-muted-foreground mt-1">Review past conversations and tips</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 rounded-xl bg-card" />
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-2">
          {sessions.map((session, i) => {
            const Icon = typeIcons[session.session_type] || MessageSquare;
            const colors = typeColors[session.session_type] || typeColors.other;
            return (
              <motion.button
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedId(session.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{session.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(session.created_date), "MMM d, yyyy")}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(session.duration_seconds)}
                    </span>
                    {session.tips_given?.length > 0 && (
                      <span className="text-xs text-primary">{session.tips_given.length} tips</span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl bg-card border border-border/50">
          <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No sessions yet</p>
          <p className="text-xs text-muted-foreground mt-1">Your completed sessions will appear here</p>
        </div>
      )}
    </div>
  );
}
