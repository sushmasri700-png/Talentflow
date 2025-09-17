import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CandidateCard from "../components/candidate/CandidateCard";
import CandidateStats from "../components/candidate/CandidateStats";
import Loader from "../components/loader/Loader";
import { db } from "../db/db";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;
  const navigate = useNavigate();

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      let allCandidates = [];
      if (window.api?.getCandidates) {
        allCandidates = await window.api.getCandidates();
      } else {
        allCandidates = await db.candidates.toArray();
      }

      if (search) {
        allCandidates = allCandidates.filter(
          (c) =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (stageFilter !== "All") {
        allCandidates = allCandidates.filter((c) => c.stage === stageFilter);
      }

      setTotal(allCandidates.length);

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      setCandidates(allCandidates.slice(start, end));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [page, search, stageFilter]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-white min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Candidates</h2>
        <Button
          onClick={() => navigate("/candidate/create")}
          className="rounded-full dark:text-white text-white flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" /> Create Candidate
        </Button>
      </div>

      {/* Stats */}
      <CandidateStats candidates={candidates} />

 <div className="flex flex-col md:flex-row gap-4 justify-between">
  {/* Search Input */}
  <Input
    placeholder="Search by name or email..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setPage(1);
    }}
    className="rounded-full border border-gray-300 dark:border-gray-700 
               bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 
               px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  {/* Stage Filter Select */}
  <Select
    value={stageFilter}
    onValueChange={(value) => {
      setStageFilter(value);
      setPage(1);
    }}
    className=""
  >
    <SelectTrigger
      className="w-full rounded-full border border-gray-300 dark:border-gray-700 
                 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 
                 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <SelectValue placeholder="Filter by stage" />
    </SelectTrigger>
    <SelectContent
      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                 border border-gray-200 dark:border-gray-700"
    >
      <SelectItem value="All">All Stages</SelectItem>
      <SelectItem value="applied">Applied</SelectItem>
      <SelectItem value="screen">Screen</SelectItem>
      <SelectItem value="tech">Tech</SelectItem>
      <SelectItem value="offer">Offer</SelectItem>
      <SelectItem value="hired">Hired</SelectItem>
      <SelectItem value="rejected">Rejected</SelectItem>
    </SelectContent>
  </Select>
</div>


      {/* Loader / Error */}
      {loading && <Loader />}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && !error && candidates.length > 0 ? (
          candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))
        ) : (
          !loading &&
          !error && (
            <div className="flex items-center justify-center col-span-3 min-h-[40vh]">
              <div className="text-center">
                <p className="text-xl text-gray-500 dark:text-gray-400">
                  No candidates found
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span className="text-gray-700 dark:text-gray-300">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
