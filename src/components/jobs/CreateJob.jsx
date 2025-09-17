// src/pages/jobs/CreateJob.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../db/db";
import { Briefcase, Plus, X, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const CreateJob = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [requirements, setRequirements] = useState([{ value: "" }]);
  const [loading, setLoading] = useState(false);

  const addRequirement = () =>
    setRequirements([...requirements, { value: "" }]);
  const removeRequirement = (index) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };
  const updateRequirement = (index, value) => {
    const newReqs = [...requirements];
    newReqs[index].value = value;
    setRequirements(newReqs);
  };

  const getStatusColor = (status) => {
    const colors = {
      Active:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700",
      Draft:
        "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
      Paused:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700",
      Closed:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (description.trim().length < 10)
      return toast.error("Description must be at least 10 characters");
    if (!requirements.some((r) => r.value.trim()))
      return toast.error("At least one requirement is needed");

    setLoading(true);
    try {
      const slug = title.toLowerCase().replace(/\s+/g, "-");
      const exists = await db.jobs.where("slug").equals(slug).first();
      if (exists) {
        toast.error("Job with this title already exists!");
        setLoading(false);
        return;
      }

      const id = await db.jobs.add({
        title,
        description,
        status,
        requirements: requirements.map((r) => r.value).filter(Boolean),
        slug,
      });

      toast.success("Job created successfully!");
      navigate(`/job/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full min-h-screen p-12 space-y-6 animate-fade-in bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Job
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Fill in the details to post a new job opening
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Briefcase className="w-5 h-5 mr-2" />
                Job Details
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Basic information about the position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="title"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Job Title *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="mt-1 border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label
                  htmlFor="description"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Job Description *
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role..."
                  rows={8}
                  className="mt-1 border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Requirements
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                List the key requirements for this position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-1">
                    <Input
                      value={req.value}
                      onChange={(e) =>
                        updateRequirement(index, e.target.value)
                      }
                      placeholder={`Requirement ${index + 1}`}
                      className="border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRequirement(index)}
                    disabled={requirements.length === 1}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addRequirement}
                className="w-full border-gray-300 dark:border-gray-600"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Requirement
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Job Status
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Control the visibility of this job posting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="status"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1 border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Paused">Paused</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Current Status:
                  </span>
                  <Badge className={`${getStatusColor(status)}`}>
                    {status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Publishing
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Ready to publish your job posting?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Create Job
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
