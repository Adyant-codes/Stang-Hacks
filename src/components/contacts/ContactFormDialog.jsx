import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const emptyContact = { name: "", relationship: "friend", occupation: "", hobbies: "", notes: "" };

export default function ContactFormDialog({ open, onOpenChange, contact, onSave, isSaving }) {
  const [form, setForm] = useState(emptyContact);

  useEffect(() => {
    setForm(contact ? { ...emptyContact, ...contact } : emptyContact);
  }, [contact, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{contact ? "Edit Contact" : "Add Contact"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Their name"
              className="bg-secondary border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Relationship</Label>
            <Select value={form.relationship} onValueChange={(v) => setForm({ ...form, relationship: v })}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="colleague">Colleague</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Occupation</Label>
            <Input
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              placeholder="What they do"
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Hobbies & Interests</Label>
            <Input
              value={form.hobbies}
              onChange={(e) => setForm({ ...form, hobbies: e.target.value })}
              placeholder="hiking, cooking, music..."
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anything else to remember..."
              className="bg-secondary border-border h-20"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !form.name} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isSaving ? "Saving..." : contact ? "Update" : "Add Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
