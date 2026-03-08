import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Briefcase, Coffee, Users, Mic, ArrowRight, User, ChevronLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const sessionTypes = [
  { type: "date", label: "Date", desc: "Romantic setting", icon: Heart, color: "border-rose-500/30 bg-rose-500/10", activeColor: "border-rose-400 bg-rose-500/20", iconColor: "text-rose-400" },
  { type: "networking", label: "Networking", desc: "Professional setting", icon: Briefcase, color: "border-blue-500/30 bg-blue-500/10", activeColor: "border-blue-400 bg-blue-500/20", iconColor: "text-blue-400" },
  { type: "casual", label: "Casual", desc: "Friendly chat", icon: Coffee, color: "border-amber-500/30 bg-amber-500/10", activeColor: "border-amber-400 bg-amber-500/20", iconColor: "text-amber-400" },
  { type: "interview", label: "Interview", desc: "Job interview", icon: Users, color: "border-purple-500/30 bg-purple-500/10", activeColor: "border-purple-400 bg-purple-500/20", iconColor: "text-purple-400" },
];

export default function SessionSetup() {
  const urlParams = new URLSearchParams(window.location.search);
  const presetType = urlParams.get("type");

  const [selectedType, setSelectedType] = useState(presetType || "casual");
  const [title, setTitle] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [contextNotes, setContextNotes] = useState("");
  const navigate = useNavigate();

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => base44.entities.Contact.list("-created_date"),
  });

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  useEffect(() => {
    if (selectedContact) {
      const parts = [];
      if (selectedContact.occupation) parts.push(`They work as: ${selectedContact.occupation}`);
      if (selectedContact.hobbies) parts.push(`Hobbies: ${selectedContact.hobbies}`);
      if (selectedContact.notes) parts.push(`Notes: ${selectedContact.notes}`);
      if (parts.length > 0) setContextNotes(parts.join("\n"));
    }
  }, [selectedContactId]);

  const handleStart = () => {
    const params = new URLSearchParams({
      type: selectedType,
      title: title || `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} session`,
    });
    if (selectedContactId) params.set("contactId", selectedContactId);
    if (selectedContact) params.set("contactName", selectedContact.name);
    if (contextNotes) params.set("context", contextNotes);
    navigate(createPageUrl("LiveSession") + `?${params.toString()}`);
  };

  return (
    <div className="p-6 md:p-8 max-w-lg mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))} className="shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">New Session</h1>
          <p className="text-xs text-muted-foreground">Configure your wingman before going live</p>
        </div>
      </div>

      {/* Session Type */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Situation</Label>
        <div className="grid grid-cols-2 gap-3">
          {sessionTypes.map((item) => (
            <button
              key={item.type}
              onClick={() => setSelectedType(item.type)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedType === item.type ? item.activeColor : `${item.color} border-transparent`
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.iconColor} mb-2`} />
              <p className="font-semibold text-foreground text-sm">{item.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Session Title */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Session Name (optional)</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Coffee with Sarah"
          className="bg-card border-border rounded-xl"
        />
      </motion.div>

      {/* Contact Selection */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Link a Contact (optional)</Label>
        <Select value={selectedContactId} onValueChange={setSelectedContactId}>
          <SelectTrigger className="bg-card border-border rounded-xl">
            <SelectValue placeholder="Select a saved contact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No contact</SelectItem>
            {contacts.map(c => (
              <SelectItem key={c.id} value={c.id}>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  {c.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Context Notes */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Context for AI</Label>
          <Sparkles className="w-3 h-3 text-primary" />
        </div>
        <Textarea
          value={contextNotes}
          onChange={(e) => setContextNotes(e.target.value)}
          placeholder="Add any helpful context... e.g. 'She loves hiking and works in tech. We met at a coffee shop last week.'"
          className="bg-card border-border rounded-xl h-28 text-sm"
        />
        <p className="text-[10px] text-muted-foreground">This helps the AI give you more relevant conversation tips</p>
      </motion.div>

      {/* Start Button */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Button
          onClick={handleStart}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-6 text-base font-semibold gap-3"
        >
          <Mic className="w-5 h-5" />
          Go Live
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
}
