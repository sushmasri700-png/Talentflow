import { useState, useEffect } from "react";

export default function JobModal({ show, onClose, onSave, job }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setStatus(job.status || "draft");
      setTags((job.tags || []).join(", "));
    } else {
      setTitle("");
      setStatus("draft");
      setTags("");
    }
  }, [job]);

  if (!show) return null;

  const handleSave = () => {
    if (!title.trim()) return alert("Title is required");

    const payload = {
      ...job,
      title,
      slug: title.trim().toLowerCase().replace(/\s+/g, "-"),
      status,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="text-xl font-bold mb-4">
          {job ? "Edit Job" : "Create Job"}
        </h3>

        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <select
          className="w-full border rounded px-3 py-2 mb-4"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
