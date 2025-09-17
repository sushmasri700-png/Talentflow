import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CandidateStats({ candidates }) {
  const total = candidates.length;
  const hired = candidates.filter((c) => c.stage?.toLowerCase() === "hired").length;
  const rejected = candidates.filter((c) => c.stage?.toLowerCase() === "rejected").length;

  const stats = [
    { label: "Total", value: total, bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-900 dark:text-gray-100" },
    { label: "Hired", value: hired, bg: "bg-green-100 dark:bg-green-900", text: "text-green-800 dark:text-green-300" },
    { label: "Rejected", value: rejected, bg: "bg-red-100 dark:bg-red-900", text: "text-red-800 dark:text-red-300" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((stat, idx) => (
        <Card
          key={idx}
          className={`flex flex-col justify-center items-center p-4 border border-gray-300 dark:border-gray-600 rounded-xl ${stat.bg}`}
        >
          <CardHeader className="text-center">
            <CardTitle className={`text-lg font-semibold ${stat.text}`}>{stat.label}</CardTitle>
            <CardDescription className={`text-2xl font-bold mt-1 ${stat.text}`}>{stat.value}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
