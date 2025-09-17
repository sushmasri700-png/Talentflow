import { useState, useEffect } from "react";

export default function AssessmentModal({
  show,
  onClose,
  onSave,
  assessment,
  jobs,
  mode = "create", // "create", "edit", "view"
}) {
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (assessment) {
      setTitle(assessment.title);
      setSections(assessment.sections || []);
    } else {
      setTitle("");
      setSections([]);
    }
  }, [assessment]);

  const addSection = () => setSections([...sections, { title: "", questions: [] }]);
  const updateSectionTitle = (idx, value) => {
    const newSections = [...sections];
    newSections[idx].title = value;
    setSections(newSections);
  };
  const addQuestion = (sectionIdx, type = "short") => {
    const newSections = [...sections];
    newSections[sectionIdx].questions.push({ label: "", type, required: true, choices: [] });
    setSections(newSections);
  };
  const updateQuestion = (sectionIdx, qIdx, field, value) => {
    const newSections = [...sections];
    if (field === "choices") {
      newSections[sectionIdx].questions[qIdx][field] = value.split(",").map((v) => v.trim());
    } else {
      newSections[sectionIdx].questions[qIdx][field] = value;
    }
    setSections(newSections);
  };

  if (!show) return null;

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const handleSaveClick = () => {
    if (onSave) {
      onSave({
        ...assessment,
        title,
        sections,
        jobId: assessment?.jobId || (jobs[0]?.id || 0),
        createdAt: assessment?.createdAt || new Date().toISOString(),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl p-6 relative text-gray-900 dark:text-gray-200 transition-colors duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {isViewMode ? "View Assessment" : isEditMode ? "Edit Assessment" : "Create Assessment"}
          </h3>
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Assessment Title */}
        <input
          type="text"
          className="w-full border dark:border-gray-600 rounded px-3 py-2 mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          placeholder="Assessment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isViewMode}
        />

        {/* Sections */}
        {sections.map((s, sIdx) => (
          <div key={sIdx} className="mb-4 border dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            {/* Section Title */}
            <div className="flex justify-between items-center mb-2">
              <input
                type="text"
                className="flex-1 border dark:border-gray-600 rounded px-2 py-1 mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                placeholder={`Section ${sIdx + 1} Title`}
                value={s.title}
                onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                disabled={isViewMode}
              />
              {!isViewMode && (
                <button
                  onClick={() => setSections(sections.filter((_, idx) => idx !== sIdx))}
                  className="ml-2 text-red-600 font-bold"
                >
                  X
                </button>
              )}
            </div>

            {/* Questions */}
            {s.questions.map((q, qIdx) => (
              <div key={qIdx} className="mb-3">
                <div className="flex gap-2 items-center mb-1">
                  <input
                    type="text"
                    className="flex-1 border dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                    placeholder="Question label"
                    value={q.label}
                    onChange={(e) => updateQuestion(sIdx, qIdx, "label", e.target.value)}
                    disabled={isViewMode}
                  />
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(sIdx, qIdx, "type", e.target.value)}
                    className="border dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                    disabled={isViewMode}
                  >
                    <option value="single">Single Choice</option>
                    <option value="multi">Multi Choice</option>
                    <option value="short">Short Text</option>
                    <option value="long">Long Text</option>
                    <option value="numeric">Numeric</option>
                    <option value="file">File Upload</option>
                  </select>
                  {!isViewMode && (
                    <button
                      onClick={() =>
                        updateQuestion(sIdx, qIdx, "delete", true) ||
                        setSections(sections[sIdx].questions.splice(qIdx, 1) && [...sections])
                      }
                      className="text-red-600 font-bold"
                    >
                      X
                    </button>
                  )}
                </div>

                {/* Options for choices */}
                {["single", "multi"].includes(q.type) && !isViewMode && (
                  <div className="flex flex-col gap-1 mb-2">
                    {(q.choices || []).map((opt, oIdx) => (
                      <input
                        key={oIdx}
                        type="text"
                        value={opt}
                        placeholder={`Option ${oIdx + 1}`}
                        onChange={(e) => {
                          const newChoices = [...q.choices];
                          newChoices[oIdx] = e.target.value;
                          updateQuestion(sIdx, qIdx, "choices", newChoices.join(","));
                        }}
                        className="px-2 py-1 border rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                      />
                    ))}
                    <button
                      onClick={() =>
                        updateQuestion(sIdx, qIdx, "choices", [...(q.choices || []), ""].join(","))
                      }
                      className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition"
                    >
                      + Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}

            {!isViewMode && (
              <button
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded mt-2 transition"
                onClick={() => addQuestion(sIdx)}
              >
                + Add Question
              </button>
            )}
          </div>
        ))}

        {!isViewMode && (
          <button
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            onClick={addSection}
          >
            + Add Section
          </button>
        )}

        {/* Live Preview */}
        <div className="mt-6 border-t dark:border-gray-600 pt-4">
          <h4 className="font-bold mb-2">Live Preview</h4>
          {(sections || []).map((s, idx) => (
            <div key={idx} className="mb-4 bg-gray-50 dark:bg-gray-700 rounded p-3">
              {s.title && <p className="font-semibold mb-2">{s.title}</p>}
              {s.questions.map((q, qidx) => (
                <div key={qidx} className="mb-2">
                  <p className="font-medium mb-1">{q.label || "Question"} ({q.type})</p>

                  {q.type === "short" && (
                    <input className="w-full border px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500" />
                  )}
                  {q.type === "long" && (
                    <textarea rows={3} className="w-full border px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"></textarea>
                  )}
                  {q.type === "numeric" && (
                    <input type="number" className="w-full border px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500" />
                  )}
                  {q.type === "file" && (
                    <input type="file" disabled className="w-full border px-2 py-1 rounded cursor-not-allowed dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500" />
                  )}
                  {q.type === "single" && (q.choices || []).map((c, i) => (
                    <label key={i} className="flex items-center gap-2 mb-1 text-gray-900 dark:text-gray-100">
                      <input type="radio" name={`q${idx}-${qidx}`} className="w-5 h-5 accent-blue-600 dark:accent-blue-400" />
                      {c}
                    </label>
                  ))}
                  {q.type === "multi" && (q.choices || []).map((c, i) => (
                    <label key={i} className="flex items-center gap-2 mb-1 text-gray-900 dark:text-gray-100">
                      <input type="checkbox" className="w-5 h-5 accent-blue-600 dark:accent-blue-400" />
                      {c}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {!isViewMode && (
          <button
            className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            onClick={handleSaveClick}
          >
            Save Assessment
          </button>
        )}
      </div>
    </div>
  );
}
