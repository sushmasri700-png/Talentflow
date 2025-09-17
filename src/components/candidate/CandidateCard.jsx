import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CandidateCard({ candidate }) {
  const navigate = useNavigate();

  // Map stages to proper badge classes for light/dark mode
  const getStageVariant = (stage) => {
    switch (stage?.toLowerCase()) {
      case "hired":
        return "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600";
    }
  };

  return (
    <Card className="flex flex-col justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{candidate.name}</CardTitle>
          <Badge className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStageVariant(candidate.stage)}`}>
            {candidate.stage || "Unknown"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300">{candidate.email}</p>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => navigate(`/candidate/${candidate.id}`)}
          className="w-full rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" /> View
        </Button>
      </CardFooter>
    </Card>
  );
}
