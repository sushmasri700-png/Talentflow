// src/components/candidate/CandidateNotes.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";

export default function CandidateNote({ candidateId, notes, setNotes }) {
  const [note, setNote] = useState("");
  const [editNote, setEditNote] = useState(null);

  const addNote = () => {
    if (!note.trim()) return;
    const newNote = {
      id: Date.now(),
      candidateId,
      text: note,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, newNote]);
    setNote("");
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const updateNote = () => {
    if (!editNote.text.trim()) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === editNote.id ? { ...n, text: editNote.text } : n))
    );
    setEditNote(null);
  };

  return (
    <div className="space-y-4">
      {/* Add Note */}
      <div className="flex flex-col md:flex-row gap-3">
        <Textarea
          placeholder="Write a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1"
        />
        <Button onClick={addNote} className="self-start md:self-auto">
          Add Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length > 0 ? (
          notes.map((n) => (
            <Card
              key={n.id}
              className="p-4 shadow-sm border border-gray-200 dark:border-gray-700 bg-card text-card-foreground"
            >
              <div className="flex justify-between items-start">
                <p className="text-sm">{n.text}</p>
                <div className="flex gap-2">
                  {/* Edit */}
                  <Dialog open={editNote?.id === n.id} onOpenChange={() => setEditNote(null)}>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditNote({ ...n })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Note</DialogTitle>
                      </DialogHeader>
                      <Textarea
                        value={editNote?.text || ""}
                        onChange={(e) =>
                          setEditNote((prev) => ({ ...prev, text: e.target.value }))
                        }
                      />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditNote(null)}>
                          Cancel
                        </Button>
                        <Button onClick={updateNote}>Save</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Delete */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteNote(n.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-sm italic">
            No notes yet. Add one above.
          </p>
        )}
      </div>
    </div>
  );
}
