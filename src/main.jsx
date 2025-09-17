import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { seedIfEmpty } from "./mock/seed";
import "./index.css";
import { ThemeProvider } from "./context/ThemeProvider";
import { db } from "./db/db";

async function init() {
  if (import.meta.env.DEV) {
    // ✅ Use MSW only in development
    const { initMocks } = await import("./mock/browser");
    await initMocks();
  }

  // ✅ Always seed IndexedDB (dev + prod)
  await seedIfEmpty();

  // ✅ Provide a global API shim for production
  if (!import.meta.env.DEV) {
    // mock fetch in production → read/write Dexie directly
    window.api = {
      getJobs: async () => db.jobs.toArray(),
      getCandidates: async () => db.candidates.toArray(),
      getAssessments: async () => db.assessments.toArray(),
      addCandidate: async (candidate) => db.candidates.add(candidate),
      addAssessment: async (assessment) => db.assessments.add(assessment),
      // getCandidates: async () => db.candidates.toArray(),
      getCandidate: async (id) => db.candidates.get(id),
      updateCandidate: async (id, updates) => db.candidates.update(id, updates).then(() => db.candidates.get(id)),
      getCandidateTimeline: async (id) => db.timelines.where("candidateId").equals(id).sortBy("timestamp"),
      getCandidateNotes: async (id) => db.notes.where("candidateId").equals(id).toArray(),
      addCandidateNote: async (candidateId, note) => db.notes.add({ candidateId, ...note }).then(id => db.notes.get(id)),
      updateNote: async (id, updates) => db.notes.update(id, updates).then(() => db.notes.get(id)),
      // add more if needed
      // add more functions as needed
    };
  }

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <ThemeProvider>
      <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}

init();
