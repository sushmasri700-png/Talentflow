import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { db } from "../../db/db"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const QUESTION_TYPES = [
  { value: "single-choice", label: "Single Choice" },
  { value: "multi-choice", label: "Multiple Choice" },
  { value: "short-text", label: "Short Answer" },
  { value: "long-text", label: "Long Answer" },
  { value: "numeric", label: "Numeric" },
  { value: "file", label: "File Upload" },
]

export default function AssessmentBuilder({ mode = "create" }) {
  const navigate = useNavigate()
  const { id, id: jobId } = useParams()

  const [title, setTitle] = useState("")
  const [sections, setSections] = useState([{ title: "", questions: [] }])
  const [loading, setLoading] = useState(false)

  // Load existing assessment if edit
  useEffect(() => {
    if (mode === "edit" && id) {
      async function fetchAssessment() {
        setLoading(true)
        const existing = await db.assessments.get(Number(id))
        if (existing) {
          setTitle(existing.title)
          setSections(existing.sections || [{ title: "", questions: [] }])
        }
        setLoading(false)
      }
      fetchAssessment()
    }
  }, [mode, id])

  // Section methods
  const addSection = () => setSections([...sections, { title: "", questions: [] }])
  const updateSectionTitle = (sIdx, value) => {
    const newSections = [...sections]
    newSections[sIdx].title = value
    setSections(newSections)
  }
  const addQuestion = (sIdx) => {
    const newSections = [...sections]
    newSections[sIdx].questions.push({
      label: "",
      type: "short-text",
      choices: [],
    })
    setSections(newSections)
  }
  const updateQuestion = (sIdx, qIdx, key, value) => {
    const newSections = [...sections]
    newSections[sIdx].questions[qIdx][key] = value
    setSections(newSections)
  }
  const addOption = (sIdx, qIdx) => {
    const newSections = [...sections]
    newSections[sIdx].questions[qIdx].choices.push("")
    setSections(newSections)
  }
  const removeOption = (sIdx, qIdx, idx) => {
    const newSections = [...sections]
    newSections[sIdx].questions[qIdx].choices.splice(idx, 1)
    setSections(newSections)
  }

  // Validation
  const validateAssessment = () => {
    if (!title.trim()) return "Assessment title is required"
    const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0)
    if (totalQuestions < 1) return "Minimum 1 question required"
    for (let s of sections) {
      for (let q of s.questions) {
        if (!q.label.trim()) return "All questions must have a label"
        if (["single-choice", "multi-choice"].includes(q.type) && q.choices.length === 0) {
          return "All choice questions must have at least one option"
        }
      }
    }
    return null
  }

  // Save / Update
  const saveAssessment = async () => {
    const error = validateAssessment()
    if (error) return alert(error)

    try {
      if (mode === "edit" && id) {
        await db.assessments.update(Number(id), {
          title,
          sections,
          updatedAt: new Date().toISOString(),
        })
        alert("Assessment updated successfully!")
      } else {
        await db.assessments.add({
          jobId: Number(jobId),
          title,
          sections,
          createdAt: new Date().toISOString(),
        })
        alert("Assessment created successfully!")
      }
      navigate("/assessment")
    } catch (err) {
      console.error(err)
      alert("Failed to save assessment")
    }
  }

  if (loading) return <p className="p-6">Loading assessment...</p>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 dark:text-gray-200">
      <h2 className="p-4 font-bold text-xl text-gray-900 dark:text-white">Assessment Builder</h2>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {/* LEFT: Builder */}
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
  <Input
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="Enter Assessment Title"
    className="text-lg font-semibold border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
  />
  <Button
    variant="outline"
    className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
    onClick={addSection}
  >
    + Add Section
  </Button>
</div>

          {sections.map((section, sIdx) => (
  <Card
    key={sIdx}
    className="overflow-visible border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
  >
    <CardHeader>
      <CardTitle>
        <Input
          value={section.title}
          onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
          placeholder={`Section ${sIdx + 1} Title`}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-4">
      {section.questions.map((q, qIdx) => (
        <div
          key={qIdx}
          className="p-3 border rounded-md space-y-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <Input
            value={q.label}
            onChange={(e) => updateQuestion(sIdx, qIdx, "label", e.target.value)}
            placeholder="Question text"
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />

          <Select
            value={q.type}
            onValueChange={(val) => {
              updateQuestion(sIdx, qIdx, "type", val)
              if (
                ["single-choice", "multi-choice"].includes(val) &&
                q.choices.length === 0
              ) {
                updateQuestion(sIdx, qIdx, "choices", ["Option 1"])
              }
            }}
          >
            <SelectTrigger className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              {QUESTION_TYPES.map((t) => (
                <SelectItem
                  key={t.value}
                  value={t.value}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {["single-choice", "multi-choice"].includes(q.type) && (
            <div className="space-y-2">
              {q.choices.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newChoices = [...q.choices]
                      newChoices[idx] = e.target.value
                      updateQuestion(sIdx, qIdx, "choices", newChoices)
                    }}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => removeOption(sIdx, qIdx, idx)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => addOption(sIdx, qIdx)}
              >
                + Add Option
              </Button>
            </div>
          )}

          {q.type === "short-text" && (
            <Input
              readOnly
              placeholder="Short answer input"
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            />
          )}
          {q.type === "long-text" && (
            <Textarea
              readOnly
              placeholder="Long answer textarea"
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            />
          )}
          {q.type === "numeric" && (
            <Input
              readOnly
              placeholder="Numeric input"
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            />
          )}
          {q.type === "file" && (
            <Input
              readOnly
              placeholder="File upload"
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            />
          )}
        </div>
      ))}

      <Button
        onClick={() => addQuestion(sIdx)}
        variant="outline"
        className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        + Add Question
      </Button>
    </CardContent>
  </Card>
))}

<Button
  onClick={saveAssessment}
  className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
>
  {mode === "edit" ? "Update Assessment" : "Create Assessment"}
</Button>

        </div>

        {/* RIGHT: Live Preview */}
        <div className="p-6 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm overflow-auto max-h-screen bg-white dark:bg-gray-900">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {title || "Live Preview"}
          </h2>

          {sections.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">
              No sections yet. Add a section to start building.
            </p>
          )}

          {sections.map((s, sIdx) => (
            <section key={sIdx} className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                {s.title}
              </h3>
              <div className="space-y-4">
                {s.questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-3 border rounded border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  >
                    <p className="font-medium mb-2 text-gray-900 dark:text-gray-100">{q.label}</p>

                    {q.type === "multi-choice" &&
                      q.choices.map((c, i) => (
                        <label key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <input type="checkbox" /> {c}
                        </label>
                      ))}

                    {q.type === "single-choice" &&
                      q.choices.map((c, i) => (
                        <label key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <input type="radio" name={`q-${sIdx}-${qIdx}`} /> {c}
                        </label>
                      ))}

                    {q.type === "numeric" && <Input placeholder="Enter number" />}
                    {q.type === "short-text" && <Input placeholder="Short answer" />}
                    {q.type === "long-text" && <Textarea placeholder="Long answer" />}
                    {q.type === "file" && <Input type="file" disabled />}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
