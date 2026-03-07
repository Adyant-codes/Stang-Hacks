import React from "react";
import { Heart, Briefcase, Coffee, Users, User, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const relationshipIcons = {
  date: Heart,
  friend: Coffee,
  colleague: Briefcase,
  networking: Users,
  other: User,
};

const relationshipColors = {
  date: "text-rose-400 bg-rose-500/10",
  friend: "text-amber-400 bg-amber-500/10",
  colleague: "text-blue-400 bg-blue-500/10",
  networking: "text-purple-400 bg-purple-500/10",
  other: "text-muted-foreground bg-muted",
};

export default function ContactCard({ contact, onEdit, onDelete }) {
  const Icon = relationshipIcons[contact.relationship] || User;
  const colors = relationshipColors[contact.relationship] || relationshipColors.other;

  return (
    <div className="p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors}`}>
            {contact.avatar_url ? (
              <img src={contact.avatar_url} alt={contact.name} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <span className="text-lg font-bold">{contact.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{contact.name}</p>
            {contact.occupation && (
              <p className="text-xs text-muted-foreground mt-0.5">{contact.occupation}</p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(contact)}>
              <Pencil className="w-3 h-3 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(contact)} className="text-destructive">
              <Trash2 className="w-3 h-3 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {contact.hobbies && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {contact.hobbies.split(",").map((hobby, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-secondary-foreground font-medium">
              {hobby.trim()}
            </span>
          ))}
        </div>
      )}
      {contact.notes && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{contact.notes}</p>
      )}
    </div>
  );
}
