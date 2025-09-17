import { useEffect, useState } from "react";
import { db } from "../db/db";
import { useParams, useNavigate } from "react-router-dom";

const QUESTION_TYPES = [
  "single-choice",
  "multi-choice",
  "short-text",
  "long-text",
  "numeric",
  "file",
];

export default function AssessmentBuilder({ mode = "create" }) {
  const navigate = useNavigate();
  const { id, id: jobId } = useParams(); // `id` = assessmentId for edit, `jobId` for create
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState([{ title: "", questions: [] }]);
  const [loading, setLoading] = useState(false);

  // Load data if editing
  useEffect(() => {
    if (mode === "edit" && id) {
      async function fetchAssessment() {
        setLoading(true);
        const existing = await db.assessments.get(Number(id));
        if (existing) {
          setTitle(existing.title);
          setSections(existing.sections || [{ title: "", questions: [] }]);
        }
        setLoading(false);
      }
      fetchAssessment();
    }
  }, [mode, id]);

  // --- Section methods ---
  const addSection = () => setSections([...sections, { title: "", questions: [] }]);

  const deleteSection = (sIdx) =>
    setSections(sections.filter((_, i) => i !== sIdx));

  const updateSectionTitle = (sIdx, value) => {
    const newSections = [...sections];
    newSections[sIdx].title = value;
    setSections(newSections);
  };

  // --- Question methods ---
  const addQuestion = (sIdx) => {
    const newSections = [...sections];
    newSections[sIdx].questions.push({
      label: "",
      type: "short-text",
      choices: [],
    });
    setSections(newSections);
  };

  const deleteQuestion = (sIdx, qIdx) => {
    const newSections = [...sections];
    newSections[sIdx].questions.splice(qIdx, 1);
    setSections(newSections);
  };

  const updateQuestion = (sIdx, qIdx, key, value) => {
    const newSections = [...sections];
    if (key === "choices") {
      newSections[sIdx].questions[qIdx][key] = value.split(",").map((v) => v.trim());
    } else {
      newSections[sIdx].questions[qIdx][key] = value;
    }
    setSections(newSections);
  };

  // --- Validation ---
  const validateAssessment = () => {
    if (!title.trim()) return "Assessment title is required";

    const totalQuestions = sections.reduce(
      (acc, s) => acc + s.questions.length,
      0
    );
    if (totalQuestions < 1) return "Minimum 1 question required";

    for (let s of sections) {
      for (let q of s.questions) {
        if (!q.label.trim()) return "All questions must have a label";
        if (
          ["single-choice", "multi-choice"].includes(q.type) &&
          q.choices.length === 0
        ) {
          return "All choice questions must have at least one option";
        }
      }
    }
    return null;
  };

  // --- Save / Update ---
  const saveAssessment = async () => {
    const error = validateAssessment();
    if (error) return alert(error);

    try {
      if (mode === "edit" && id) {
        await db.assessments.update(Number(id), {
          title,
          sections,
          updatedAt: new Date().toISOString(),
        });
        alert("Assessment updated successfully!");
      } else {
        await db.assessments.add({
          jobId: Number(jobId),
          title,
          sections,
          createdAt: new Date().toISOString(),
        });
        alert("Assessment created successfully!");
      }
      navigate("/assessment"); // back to list page
    } catch (err) {
      console.error(err);
      alert("Failed to save assessment");
    }
  };

  if (loading) return <p className="p-6">Loading assessment...</p>;

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* LEFT: Builder */}
        <div className="flex-1 space-y-4">
          {/* Title */}
          <input
            type="text"
            placeholder="Enter Assessment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-gray-100"
          />

          {/* Sections */}
          {sections.map((section, sIdx) => (
            <div
              key={sIdx}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow space-y-3"
            >
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                  placeholder={`Section ${sIdx + 1} Title (Optional)`}
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-gray-100"
                />
                <button
                  onClick={() => deleteSection(sIdx)}
                  className="ml-2 text-red-600 font-bold"
                >
                  X
                </button>
              </div>

              {/* Questions */}
              {section.questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="border p-3 rounded-lg space-y-2 bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex flex-col md:flex-row gap-2 items-start">
                    <input
                      type="text"
                      value={q.label}
                      onChange={(e) =>
                        updateQuestion(sIdx, qIdx, "label", e.target.value)
                      }
                      placeholder="Enter question label"
                      className="flex-1 px-2 py-1 border rounded-lg dark:bg-gray-600 dark:text-gray-100"
                    />
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(sIdx, qIdx, "type", e.target.value)
                      }
                      className="px-2 py-1 border rounded-lg dark:bg-gray-600 dark:text-gray-100"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => deleteQuestion(sIdx, qIdx)}
                      className="text-red-600 font-bold"
                    >
                      X
                    </button>
                  </div>

                  {["single-choice", "multi-choice"].includes(q.type) && (
                    <div className="flex flex-col gap-1">
                      {q.choices.map((opt, oIdx) => (
                        <input
                          key={oIdx}
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newChoices = [...q.choices];
                            newChoices[oIdx] = e.target.value;
                            updateQuestion(
                              sIdx,
                              qIdx,
                              "choices",
                              newChoices.join(",")
                            );
                          }}
                          placeholder={`Option ${oIdx + 1}`}
                          className="px-2 py-1 border rounded-lg dark:bg-gray-600 dark:text-gray-100"
                        />
                      ))}
                      <button
                        onClick={() =>
                          updateQuestion(
                            sIdx,
                            qIdx,
                            "choices",
                            [...q.choices, ""].join(",")
                          )
                        }
                        className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => addQuestion(sIdx)}
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
              >
                + Add Question
              </button>
            </div>
          ))}

          {/* Add Section */}
          <button
            onClick={addSection}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition"
          >
            + Add Section
          </button>

          {/* Save Button */}
          <button
            onClick={saveAssessment}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition w-full mt-4"
          >
            {mode === "edit" ? "Update Assessment" : "Create Assessment"}
          </button>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-4">Live Preview</h2>
          {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
          {sections.map((s, sIdx) => (
            <div key={sIdx} className="mb-6">
              {s.title && <h4 className="font-semibold mb-2">{s.title}</h4>}
              {s.questions.map((q, qIdx) => (
                <div key={qIdx} className="mb-4">
                  <p className="font-medium mb-2">
                    {qIdx + 1}. {q.label}
                  </p>
                  {q.type === "short-text" && <input type="text" className="w-full border rounded px-2 py-1" />}
                  {q.type === "long-text" && <textarea rows={3} className="w-full border rounded px-2 py-1" />}
                  {q.type === "numeric" && <input type="number" className="w-full border rounded px-2 py-1" />}
                  {q.type === "file" && <input type="file" disabled className="w-full border rounded px-2 py-1 cursor-not-allowed" />}
                  {q.type === "single-choice" &&
                    q.choices.map((c, i) => (
                      <label key={i} className="flex items-center gap-2">
                        <input type="radio" name={`q${sIdx}-${qIdx}`} />
                        {c}
                      </label>
                    ))}
                  {q.type === "multi-choice" &&
                    q.choices.map((c, i) => (
                      <label key={i} className="flex items-center gap-2">
                        <input type="checkbox" />
                        {c}
                      </label>
                    ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
