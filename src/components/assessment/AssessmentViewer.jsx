import React, { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { db } from "../../db/db"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash, Edit } from "lucide-react"

export default function AssessmentViewer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState(null)

  useEffect(() => {
    async function fetchAssessment() {
      const a = await db.assessments.get(Number(id))
      if (!a) return

      const job = await db.jobs.get(a.jobId)
      setAssessment({
        ...a,
        jobTitle: job?.title || "Job not found",
      })
    }
    fetchAssessment()
  }, [id])

  if (!assessment) {
    return <p className="p-4 text-gray-500 dark:text-gray-400">Loading assessment...</p>
  }

  const { title, jobTitle, sections = [], createdAt } = assessment

  async function handleDelete() {
    await db.assessments.delete(Number(id))
    navigate(-1)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* LEFT SECTION: Questions */}
      <div className="lg:col-span-2 space-y-6">
        {/* Top header */}
        <div className="flex flex-col p-4 md:flex-row md:items-center justify-between gap-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {jobTitle && <p className="text-gray-500 dark:text-gray-400">{jobTitle}</p>}
          </div>
          <div className="flex gap-2">
            <Link to={`/assessment/create/${id}`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" /> Edit Assessment
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </div>

        {/* Sections + Questions */}
        {sections.map((s, sIdx) => (
          <Card
            key={sIdx}
            className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            {s.title && <h3 className="font-semibold text-lg">{s.title}</h3>}
            {s.questions.map((q, idx) => (
              <div key={idx} className="space-y-2">
                <CardHeader className="py-1">
                  <CardTitle className="text-sm md:text-base font-medium">
                    {idx + 1}. {q.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-1">
                  {/* Multi Choice */}
                  {q.type === "multi-choice" && (
                    <div className="flex flex-col gap-1">
                      {q.choices.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <Checkbox /> <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Single Choice */}
                  {q.type === "single-choice" && (
                    <RadioGroup className="flex flex-col gap-1">
                      {q.choices.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <RadioGroupItem value={opt} /> <span>{opt}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Text */}
                  {q.type === "short-text" && (
                    <Input placeholder="Your short answer..." className="mt-1" />
                  )}
                  {q.type === "long-text" && (
                    <Textarea placeholder="Your long answer..." className="mt-1" />
                  )}

                  {/* Numeric */}
                  {q.type === "numeric" && (
                    <Input type="number" placeholder="Enter number" className="mt-1" />
                  )}

                  {/* File */}
                  {q.type === "file" && <Input type="file" className="mt-1" />}
                </CardContent>
              </div>
            ))}
          </Card>
        ))}

        <CardFooter className="flex justify-end border-t border-gray-200 dark:border-gray-700">
          <Button>Submit Assessment</Button>
        </CardFooter>
      </div>

      {/* RIGHT SECTION: Quick Actions + Info */}
      <div className="space-y-6">
        {/* Quick Action Card */}
        <Card className="p-4 space-y-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p className="font-semibold text-gray-700 dark:text-gray-200">Quick Actions</p>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="rounded-xl">Create Job</Button>
            <Button variant="outline" className="rounded-xl">Show Responses</Button>
          </div>
        </Card>

        {/* Additional Info Card */}
        <Card className="p-4 space-y-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Assessment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p><span className="font-medium">Job Title:</span> {jobTitle}</p>
            <p>
              <span className="font-medium">Total Questions:</span>{" "}
              {sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0)}
            </p>
            <p>
              <span className="font-medium">Created At:</span>{" "}
              {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
