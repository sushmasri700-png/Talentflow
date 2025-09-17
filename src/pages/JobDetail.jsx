import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { db } from "../db/db";
import { Button } from "@/components/ui/button";

const STATUSES = ["draft", "active", "archived"];
const TABS = ["Job Description", "Dates & Deadlines", "Reviews", "FAQs & Discussions"];

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Job Description");
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    async function fetchJobAndAssessments() {
      try {
        // Fetch job from IndexedDB (window.api if exists, fallback to Dexie)
        let allJobs = [];
        if (window.api?.getJobs) {
          allJobs = await window.api.getJobs();
        } else {
          allJobs = await db.jobs.toArray();
        }

        const foundJob = allJobs.find((j) => j.id === parseInt(id, 10)) || null;
        setJob(foundJob);

        // Fetch assessments for this job
        const allAssessments = await db.assessments.toArray();
        const jobAssessments = allAssessments.filter((a) => a.jobId === parseInt(id, 10));
        setAssessments(jobAssessments);
      } catch (err) {
        console.error("Failed to fetch job/assessments:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchJobAndAssessments();
  }, [id]);

  if (loading) return <p className="p-6">Loading job details...</p>;
  if (!job) return <p className="p-6">Job not found.</p>;

  const handleDragEnd = async (result) => {
    const { destination } = result;
    if (!destination) return;

    const newStatus = destination.droppableId;
    if (job.status === newStatus) return;

    const oldJob = { ...job };
    setJob({ ...job, status: newStatus });

    try {
      await db.jobs.update(job.id, { status: newStatus });
    } catch (err) {
      console.error("Failed to update job status:", err);
      setJob(oldJob);
      alert("Failed to update status. Try again.");
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300">
      {/* LEFT SIDE */}
      <div className="lg:col-span-2 space-y-6">
        {/* Job Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <h2 className="text-2xl font-bold">{job.title}</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <p><span className="font-semibold">Job Type:</span> {job.type || "In-Office"}</p>
            <p><span className="font-semibold">#Openings:</span> {job.openings || 2}</p>
            <p><span className="font-semibold">Start Date:</span> {job.startDate || "20 Oct 2025"}</p>
            <p><span className="font-semibold">Experience:</span> {job.experience || "0-3 years"}</p>
            <p><span className="font-semibold">Package:</span> {job.package || "₹4-6 LPA"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="text-gray-700 dark:text-gray-200 space-y-3 transition-colors duration-300">
            {activeTab === "Job Description" && (
              <div className="space-y-4">
                <p>{job.description || "We are looking for a passionate Software Engineer to join our dynamic team."}</p>
              </div>
            )}

            {activeTab === "Dates & Deadlines" && (
              <ul className="list-disc list-inside space-y-1">
                <li>Application Open: {job.startDate || "20 Oct 2025"}</li>
                <li>Application Deadline: {job.deadline || "15 Nov 2025"}</li>
                <li>Interview Rounds: Last week of Nov 2025</li>
                <li>Joining Date: {job.joiningDate || "Jan 2026"}</li>
              </ul>
            )}

            {activeTab === "Reviews" && (
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">⭐⭐⭐⭐ Great learning culture.</div>
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">⭐⭐⭐⭐⭐ Supportive mentors.</div>
              </div>
            )}

            {activeTab === "FAQs & Discussions" && (
              <div className="space-y-3">
                <p className="font-medium">Q: Is this role remote?</p>
                <p>A: {job.type || "In-Office"}.</p>
              </div>
            )}
          </div>
        </div>

        {/* Drag & Drop Status Board */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Job Status</h3>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STATUSES.map((status) => (
                <Droppable key={status} droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 rounded-lg min-h-[100px] border transition-colors duration-300 ${
                        snapshot.isDraggingOver
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <h4 className="font-semibold capitalize mb-2">{status}</h4>
                      {job.status === status && (
                        <Draggable draggableId={job.id.toString()} index={0}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white dark:bg-gray-700 p-3 rounded shadow mb-2 transition-colors duration-300"
                            >
                              {job.title}
                            </div>
                          )}
                        </Draggable>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">Quick Actions</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="rounded-xl">Create Job</Button>
            <Button variant="outline" className="rounded-xl">Show Responses</Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Additional Info</h3>
          <p>Department: Engineering</p>
          <p>Posted By: Admin</p>
          <p>Last Updated: Today</p>
        </div>

        {/* Assessments */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Assessments</h3>
            <Link
              to={`/assessment/create/${id}`}
              className="px-3 py-1 bg-blue-600 text-white rounded-2xl text-sm hover:bg-blue-700"
            >
              + Add
            </Link>
          </div>

          {assessments.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {assessments.map((a) => (
                <li
                  key={a.id}
                  className="p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => navigate(`/assessment/view/${a.id}`)}
                >
                  {a.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No assessments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
