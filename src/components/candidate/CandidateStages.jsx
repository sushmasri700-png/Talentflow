import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { UserCheck, UserX, FileText, Code, CalendarCheck, UserPlus } from "lucide-react";

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];
const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

const STAGE_META = {
  applied: { icon: UserPlus, color: "bg-blue-500" },
  screen: { icon: FileText, color: "bg-yellow-400" },
  tech: { icon: Code, color: "bg-purple-500" },
  offer: { icon: CalendarCheck, color: "bg-green-400" },
  hired: { icon: UserCheck, color: "bg-green-600" },
  rejected: { icon: UserX, color: "bg-red-500" },
};

export default function CandidateStages({ candidate, setCandidate, setTimeline }) {
  const [board, setBoard] = useState({});

  const buildBoard = (candidate) => {
    const columns = {};
    STAGES.forEach((stage) => {
      columns[stage] =
        candidate.stage === stage
          ? [
              {
                id: candidate.id.toString(),
                name: candidate.name,
                email: candidate.email,
                image: candidate.image,
              },
            ]
          : [];
    });
    return columns;
  };

  useEffect(() => {
    if (candidate) setBoard(buildBoard(candidate));
  }, [candidate]);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    if (sourceCol !== destCol) {
      const updated = { ...candidate, stage: destCol };
      setCandidate(updated);

      setTimeline((prev) => [
        ...prev,
        {
          fromStage: sourceCol,
          toStage: destCol,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    const newBoard = { ...board };
    const [moved] = newBoard[sourceCol].splice(source.index, 1);
    newBoard[destCol].splice(destination.index, 0, moved);
    setBoard(newBoard);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto">
        {STAGES.map((stage) => {
          const { icon: Icon, color } = STAGE_META[stage];
          return (
            <Droppable key={stage} droppableId={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 rounded-lg w-full md:w-40 min-h-[120px] flex-shrink-0 transition-colors duration-300 
                    ${snapshot.isDraggingOver ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  <div className="flex items-center mb-2">
                    <Icon className={`w-5 h-5 mr-2 ${color} text-white p-1 rounded-full`} />
                    <h3 className="font-semibold capitalize dark:text-gray-200">{stage}</h3>
                  </div>
                  {board[stage]?.map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-3 mt-4 bg-white dark:bg-gray-700 rounded-lg shadow mb-2 hover:shadow-lg transition cursor-grab flex items-center gap-3"
                        >
                          <img
                            src={card.image || DEFAULT_AVATAR}
                            alt={card.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <p className="text-sm text-gray-800 dark:text-gray-200">{card.name.split(" ")[0]}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
