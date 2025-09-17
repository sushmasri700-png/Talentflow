import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../db/db";
import JobModal from "../components/jobs/JobModal";
import JobCard from "../components/jobs/JobCard"; // ✅ new JobCard import
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search,Briefcase, BriefcaseIcon } from "lucide-react";
import { Spinner } from "@/components/Spinner"; // ✅ Spinner import

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalProps, setModalProps] = useState({ show: false, job: null });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch jobs from IndexedDB
  const fetchJobs = async () => {
    setLoading(true);
    let collection = [];
    try {
      if (window.api?.getJobs) {
        collection = await window.api.getJobs();
      } else {
        collection = await db.jobs.toArray();
      }

      // Apply filters
      if (search) {
        collection = collection.filter(
          (j) =>
            j.title.toLowerCase().includes(search.toLowerCase()) ||
            (j.status || "").toLowerCase().includes(search.toLowerCase())
        );
      }

      if (statusFilter !== "All") {
        collection = collection.filter((j) => j.status === statusFilter);
      }

      // Pagination
      setTotal(collection.length);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      setJobs(collection.slice(start, end));
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, search, statusFilter]);

  const openModal = (job = null) => {
    setModalProps({ show: true, job });
  };

  const handleSaveJob = async (jobData) => {
    try {
      let slug = jobData.slug || jobData.title.toLowerCase().replace(/\s+/g, "-");
      const exists = await db.jobs.where("slug").equals(slug).first();
      if (exists && exists.id !== jobData.id) {
        return alert("Job with this title already exists.");
      }

      if (jobData.id) {
        await db.jobs.put({ ...jobData, slug });
      } else {
        const id = await db.jobs.add({ ...jobData, slug });
        jobData.id = id;
      }

      fetchJobs();
      setModalProps({ show: false, job: null });
    } catch (err) {
      console.error("Failed to save job:", err);
    }
  };

  const handleArchive = async (job) => {
    try {
      const updated = {
        ...job,
        status: job.status === "Archived" ? "Active" : "Archived",
      };
      await db.jobs.put(updated);
      fetchJobs();
    } catch (err) {
      console.error("Failed to archive/unarchive job:", err);
    }
  };

  const handleDelete = async (job) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      await db.jobs.delete(job.id);
      fetchJobs();
    }
  };

  const navigateCreateJob = () => {
    navigate("/job/create");
  };

  const totalPages = Math.ceil(total / pageSize);

  // Stats
  const totalJobs = total;
  const activeJobs = jobs.filter((j) => j.status === "Active").length;
  const archivedJobs = jobs.filter((j) => j.status === "Archived").length;
  const inactiveJobs = jobs.filter((j) => j.status === "Inactive").length;

  return (
    <div className="space-y-6 dark:bg-gray-900 dark:text-gray-100 min-h-screen p-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Jobs</h1>

        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 w-4 h-4" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] rounded-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-md shadow-lg">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Create Job Button */}
          <Button
            onClick={navigateCreateJob}
            className="w-full md:w-auto rounded-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            + Create Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    <CardHeader>
      <CardTitle>Total Jobs</CardTitle>
      <CardDescription>{totalJobs}</CardDescription>
    </CardHeader>
  </Card>
  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    <CardHeader>
      <CardTitle>Active</CardTitle>
      <CardDescription>{activeJobs}</CardDescription>
    </CardHeader>
  </Card>
  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    <CardHeader>
      <CardTitle>Archived</CardTitle>
      <CardDescription>{archivedJobs}</CardDescription>
    </CardHeader>
  </Card>
  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    <CardHeader>
      <CardTitle>Inactive</CardTitle>
      <CardDescription>{inactiveJobs}</CardDescription>
    </CardHeader>
  </Card>
</div>

{/* Job Cards */}
<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {loading ? (
    <div className="col-span-full flex justify-center items-center py-20">
      <Spinner className="h-12 w-12 border-blue-800" />
    </div>
  ) : jobs.length > 0 ? (
    jobs.map((job) => (
      <JobCard
        key={job.id}
        job={job}
        onView={() => navigate(`/job/${job.id}`)}
        onEdit={() => openModal(job)}
        onArchive={() => handleArchive(job)}
        onDelete={() => handleDelete(job)}
      />
    ))
  ) : (
    <div className="col-span-full">
      <Card className="flex flex-col items-center justify-center py-20 border border-gray-200 dark:border-gray-700">
        <BriefcaseIcon className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          No jobs found
        </p>
      </Card>
    </div>
  )}
</div>

{/* Pagination */}
<div className="flex text-xs justify-center items-center mt-6 space-x-4">
  <Button
    variant="outline"
    className="text-xs border border-gray-300 dark:border-gray-700"
    disabled={page === 1}
    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
  >
    Previous
  </Button>
  <span className="text-gray-900 dark:text-gray-300">
    Page {page} of {totalPages}
  </span>
  <Button
    className="text-xs border border-gray-300 dark:border-gray-700"
    variant="outline"
    disabled={page === totalPages}
    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
  >
    Next
  </Button>
</div>


     

    </div>
  );
}
