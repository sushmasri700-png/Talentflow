import { useEffect, useState } from "react";
import { db } from "../db/db";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Assessments() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch jobs
        const jobsData = await db.jobs.toArray();
        setJobs(jobsData);

        // Fetch assessments
        const assessmentsData = await db.assessments.toArray();

        // Enrich assessments with job title + total questions
        const enriched = assessmentsData.map((a) => {
          const job = jobsData.find((j) => j.id === a.jobId);
          const totalQuestions = (a.sections || []).reduce(
            (acc, s) => acc + (s.questions?.length || 0),
            0
          );
          return {
            ...a,
            jobTitle: job?.title || "Job not found",
            totalQuestions,
          };
        });

        setAssessments(enriched);
      } catch (err) {
        console.error("Failed to fetch assessments/jobs:", err);
      }
    }

    fetchData();
  }, []);

  const viewAssessmentHandler = (id) => {
    navigate(`/assessment/view/${id}`);
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 dark:bg-gray-900 min-h-screen dark:text-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center">
      <h2 className="flex items-center gap-2 text-xl px-4 font-bold text-gray-900 dark:text-white">
  <ClipboardList className="w-6 h-6 text-gray-700 dark:text-gray-300" />
  Assessments
</h2>
        {/* <Button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          onClick={() => navigate("/assessment/create")}
        >
          + Create Assessment
        </Button> */}
      </div>

      {/* Assessment Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assessments.length > 0 ? (
          assessments.map((a) => (
            <Card
              key={a.id}
              className="flex flex-col justify-between hover:shadow-lg dark:border-gray-700 cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
            >
              <CardHeader>
                <CardTitle className="truncate">{a.title}</CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{a.jobTitle}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {a.sections?.length || 0} sections, {a.totalQuestions} questions
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="flex items-center dark:border-gray-700 justify-between w-full rounded-lg"
                  onClick={() => viewAssessmentHandler(a.id)}
                >
                  View Assessment <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="p-6 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No assessments found.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
