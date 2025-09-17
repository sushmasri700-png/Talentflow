// src/components/jobs/JobCard.jsx
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Eye } from "lucide-react";

export default function JobCard({ job, onView, onEdit, onArchive, onDelete }) {
  return (
    <Card className="flex flex-col justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors">
  {/* Header */}
  <CardHeader>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Briefcase className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <CardTitle className="text-base md:text-lg text-gray-900 dark:text-gray-100">
          {job.title}
        </CardTitle>
      </div>
      <Badge
        className={`px-2 text-xs font-medium rounded-full border ${
          job.status === "Active"
            ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
            : job.status === "Archived"
            ? "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            : "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700"
        }`}
      >
        {job.status}
      </Badge>
    </div>
  </CardHeader>

  {/* Content */}
  <CardContent>
    <div className="flex flex-wrap gap-2 mb-2">
      {job.tags?.map((tag, idx) => (
        <Badge
          key={idx}
          className="text-xs px-2 py-0.5 rounded-md border border-gray-300 bg-gray-100 text-gray-700 
                     dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
        >
          {tag}
        </Badge>
      ))}
    </div>

    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
      {job.description || "No description available."}
    </p>
  </CardContent>

  {/* Footer (Actions) */}
  <CardFooter className="flex gap-2">
    <Button
      onClick={onView}
      className="flex-1 rounded-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
    >
      <Eye className="w-4 h-4" /> View
    </Button>
    <Button
      onClick={onEdit}
      variant="outline"
      className="flex-1 rounded-full border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
    >
      Edit
    </Button>
    <Button
      onClick={onArchive}
      variant="outline"
      className="flex-1 rounded-full border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
    >
      {job.status === "Archived" ? "Unarchive" : "Archive"}
    </Button>
    <Button
      onClick={onDelete}
      variant="destructive"
      className="flex-1 rounded-full"
    >
      Delete
    </Button>
  </CardFooter>
</Card>

  );
}
