// src/pages/CandidateProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../db/db";
import CandidateStages from "../components/candidate/CandidateStages";
import CandidateTimeline from "../components/candidate/CandidateTimeline";
import CandidateNotes from "../components/candidate/CandidateNotes";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

export default function CandidateProfile() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);

  const fetchCandidate = async () => {
    const data = await db.candidates.get(Number(id));
    setCandidate(data);
  };

  const fetchTimeline = async () => {
    const data = await db.timelines
      .where("candidateId")
      .equals(Number(id))
      .toArray();
    setTimeline(data);
  };

  const fetchNotes = async () => {
    const data = await db.notes
      .where("candidateId")
      .equals(Number(id))
      .toArray();
    setNotes(data);
  };

  useEffect(() => {
    fetchCandidate();
    fetchTimeline();
    fetchNotes();
  }, [id]);

  if (!candidate) return <p className="p-6">Loading candidate...</p>;

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-900 text-black dark:text-gray-200 transition-colors duration-300">
      {/* Candidate Info */}
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow p-4">
        <div className="flex items-center gap-4">
          <img
            src={candidate.image || DEFAULT_AVATAR}
            alt={candidate.name}
            className="w-32 h-32 rounded-full object-cover border border-gray-200 dark:border-gray-700"
          />
          <div>
            <h2 className="text-2xl font-bold">{candidate.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{candidate.email}</p>
          </div>
        </div>
        <div className="px-6 py-2 bg-green-200 dark:bg-green-700 dark:text-white rounded-3xl font-medium">
          {candidate.stage}
        </div>
      </div>

      {/* Kanban Stages */}
      <div className="text-xl font-bold">Stages</div>
      <CandidateStages
        candidate={candidate}
        setCandidate={setCandidate}
        setTimeline={setTimeline}
      />

      {/* Timeline */}
      <CandidateTimeline timeline={timeline} />

      {/* Notes */}
      <CandidateNotes
        candidateId={candidate.id}
        notes={notes}
        setNotes={setNotes}
      />
    </div>
  );
}
