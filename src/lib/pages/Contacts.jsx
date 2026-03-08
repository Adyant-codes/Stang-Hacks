import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ContactCard from "../components/contacts/ContactCard";
import ContactFormDialog from "../components/contacts/ContactFormDialog";

export default function Contacts() {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => base44.entities.Contact.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setShowForm(false);
      setEditingContact(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contacts"] }),
  });

  const handleSave = (form) => {
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDelete = (contact) => {
    if (window.confirm(`Delete ${contact.name}?`)) {
      deleteMutation.mutate(contact.id);
    }
  };

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.occupation?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Contacts</h1>
          <p className="text-xs text-muted-foreground mt-1">People you interact with</p>
        </div>
        <Button
          onClick={() => { setEditingContact(null); setShowForm(true); }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-2"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {contacts.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="pl-10 bg-card border-border rounded-xl"
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl bg-card" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <motion.div layout className="grid gap-3">
          {filtered.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ContactCard contact={contact} onEdit={handleEdit} onDelete={handleDelete} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 rounded-2xl bg-card border border-border/50">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search ? "No contacts found" : "No contacts yet"}
          </p>
          {!search && (
            <p className="text-xs text-muted-foreground mt-1">Add people you'll be talking to for personalized tips</p>
          )}
        </div>
      )}

      <ContactFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        contact={editingContact}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
