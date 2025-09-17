import React, { useState } from "react";
import { db } from "../../db/db";

export default function CandidateNotes({ candidateId, notes, setNotes }) {
  const [newNote, setNewNote] = useState("");

  const addNote = async () => {
    if (!newNote.trim()) return;
    const note = {
      candidateId,
      text: newNote,
      createdAt: new Date().toISOString(),
    };
    await db.notes.add(note);
    setNewNote("");
    setNotes((prev) => [...prev, note]);
  };

  return (
    <div className="dark:text-gray-200">
      <h3 className="text-xl font-semibold mb-2">Notes</h3>
      <div className="space-y-2 mb-4">
        {notes.map((n, i) => (
          <div key={i} className="p-2 bg-white dark:bg-gray-700 shadow rounded transition-colors duration-300">
            <p>{n.text}</p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(n.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Write a note... use @ to mention"
        className="w-full border dark:border-gray-600 rounded-lg p-2 mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
      />
      <button
        onClick={addNote}
        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
      >
        Add Note
      </button>
    </div>
  );
}
