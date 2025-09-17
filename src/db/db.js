// src/db.js
import Dexie from "dexie";

export const db = new Dexie("talentflowDB");
db.version(1).stores({
  jobs: "++id,slug,title,status,order", // order is numeric
  candidates: "++id,jobId,name,email,stage",
  timelines: "++id,candidateId,timestamp,fromStage,toStage,meta",
  assessments: "++id,jobId,title", // ++id is primary key, multiple assessments allowed per job

  submissions: "++id,jobId,candidateId,submittedAt",
  notes: "++id, candidateId, text, timestamp" // ✅ added notes store
});

// helper to clear and seed (used by seed script)
export const clearAll = async () => {
  await db.jobs.clear();
  await db.candidates.clear();
  await db.timelines.clear();
  await db.assessments.clear();
  await db.submissions.clear();
  await db.notes.clear(); // ✅ clear notes too
};
