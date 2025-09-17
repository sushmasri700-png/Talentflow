import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../db/db";

export default function ViewAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    async function fetchAssessment() {
      const data = await db.assessments.get(Number(id));
      setAssessment(data);
    }
    fetchAssessment();
  }, [id]);

  if (!assessment) return <p className="p-6">Loading...</p>;

  const handleEdit = () => {
    navigate(`/assessment/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this assessment?")) {
      await db.assessments.delete(Number(id));
      navigate(-1); // Go back after delete
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{assessment.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>

      {assessment.sections?.length === 0 && (
        <p>No sections added yet.</p>
      )}

      {assessment.sections?.map((s, sIdx) => (
        <div
          key={sIdx}
          className="mb-4 p-4 rounded bg-white dark:bg-gray-800 border dark:border-gray-600"
        >
          {s.title && <h2 className="font-semibold mb-2">{s.title}</h2>}

          {s.questions?.map((q, qIdx) => (
            <div key={qIdx} className="mb-3">
              <p className="font-medium mb-1">
                {qIdx + 1}. {q.label}
              </p>

              {q.type === "short" && (
                <input
                  type="text"
                  className="w-full border px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500"
                />
              )}
              {q.type === "long" && (
                <textarea
                  rows={3}
                  className="w-full border px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500"
                />
              )}
              {q.type === "numeric" && (
                <input
                  type="number"
                  className="w-full border px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500"
                />
              )}
              {q.type === "file" && (
                <input
                  type="file"
                  disabled
                  className="w-full border px-2 py-1 rounded cursor-not-allowed dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500"
                />
              )}
              {q.type === "single" &&
                q.choices?.map((c, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 mb-1"
                  >
                    <input
                      type="radio"
                      name={`q${sIdx}-${qIdx}`}
                      className="w-5 h-5 accent-blue-600 dark:accent-blue-400"
                    />
                    {c}
                  </label>
                ))}
              {q.type === "multi" &&
                q.choices?.map((c, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 mb-1"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-blue-600 dark:accent-blue-400"
                    />
                    {c}
                  </label>
                ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
