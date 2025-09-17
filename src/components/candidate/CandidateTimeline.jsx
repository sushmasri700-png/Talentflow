import React from "react";
import { UserCheck, UserX, FileText, Code, CalendarCheck, UserPlus } from "lucide-react";

const STAGE_META = {
  applied: { icon: UserPlus, color: "bg-blue-500" },
  screen: { icon: FileText, color: "bg-yellow-400" },
  tech: { icon: Code, color: "bg-purple-500" },
  offer: { icon: CalendarCheck, color: "bg-green-400" },
  hired: { icon: UserCheck, color: "bg-green-600" },
  rejected: { icon: UserX, color: "bg-red-500" },
};

export default function CandidateTimeline({ timeline }) {
  return (
    <div className="dark:text-gray-200">
      <h3 className="text-xl font-semibold mb-4">Timeline</h3>
      <div className="flex flex-col">
        {timeline.map((t, i) => {
          const stage = t.toStage || "applied";
          const { icon: Icon, color } = STAGE_META[stage] || STAGE_META.applied;
          return (
            <div key={i} className="relative flex gap-6 pb-5">
              <div className="flex flex-col items-center">
                {i !== 0 && <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>}
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${color}`}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                {i !== timeline.length - 1 && <div className="w-px flex-1 bg-gray-300 dark:bg-gray-600"></div>}
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{t.fromStage || "Created"}</span> →{" "}
                  <span className="font-medium">{t.toStage}</span>
                </p>
                {t.meta?.note && (
                  <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">{t.meta.note}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(t.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
