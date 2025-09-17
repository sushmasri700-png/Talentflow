import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  Plus,
  Eye,
  Calendar as CalendarIcon,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Calendar } from "../components/ui/calendar";
import { db } from "../db/db"; // ✅ import Dexie DB

// ✅ Base styles for all cards
const cardBase =
  "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm";
const cardHover =
  "transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg";

const Dashboard = () => {
  const navigate = useNavigate();

  // 🔹 States for DB Data
  const [stats, setStats] = useState({
    total_jobs: 0,
    active_jobs: 0,
    total_candidates: 0,
    hired_candidates: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentCandidates, setRecentCandidates] = useState([]);

  // 🔹 Timer
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔹 Calendar
  const [date, setDate] = useState(new Date());

  // 🔹 Fetch Data from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobs = await db.jobs.toArray();
        const candidates = await db.candidates.toArray();

        // Stats
        const total_jobs = jobs.length;
        const active_jobs = jobs.filter((j) => j.status === "Active").length;
        const total_candidates = candidates.length;
        const hired_candidates = candidates.filter(
          (c) => c.stage === "Hired"
        ).length;

        setStats({ total_jobs, active_jobs, total_candidates, hired_candidates });

        // Recent Jobs (latest 3)
        setRecentJobs(
          jobs
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3)
        );

        // Recent Candidates (latest 3)
        setRecentCandidates(
          candidates.sort((a, b) => b.id - a.id).slice(0, 3)
        );
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  // 🔹 Stat Card Component
  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    color = "blue",
  }) => (
    <Card className={`${cardBase} ${cardHover}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            <span className="text-green-600 dark:text-green-400 font-medium">
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // 🔹 Badge Helpers
  const getStageColor = (stage) => {
    const colors = {
      Applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "Phone Screen":
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      "Technical Assessment":
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Interview:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      "Final Review":
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Hired: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Rejected:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return (
      colors[stage] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    );
  };

  const getJobStatusColor = (status) => {
    const colors = {
      Active:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Draft:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      Paused:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Closed:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    );
  };

  return (
    <div className="space-y-8 animate-fade-in p-8 dark:bg-gray-900 min-h-screen dark:text-gray-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Overview of your hiring pipeline and team performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link to="/job/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (Stats + Activity) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Total Jobs"
              value={stats.total_jobs}
              icon={Briefcase}
              description={`${stats.active_jobs} active positions`}
              trend="+12% from last month"
              color="blue"
            />
            <StatCard
              title="Total Candidates"
              value={stats.total_candidates}
              icon={Users}
              description="In pipeline"
              trend="+25% from last month"
              color="green"
            />
            <StatCard
              title="Hired This Month"
              value={stats.hired_candidates}
              icon={TrendingUp}
              description="Successfully placed"
              trend="+8% from last month"
              color="purple"
            />
            <StatCard
              title="Avg. Time to Hire"
              value="12 days"
              icon={Clock}
              description="Industry benchmark: 23 days"
              trend="-3 days improvement"
              color="orange"
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Jobs */}
            <Card className={`${cardBase} ${cardHover}`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    Recent Jobs
                  </CardTitle>
                  <CardDescription>
                    Latest job postings and their status
                  </CardDescription>
                </div>
                <Link to="/jobs">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No jobs found
                    </p>
                  ) : (
                    recentJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {job.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Created{" "}
                            {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          className={`${getJobStatusColor(job.status)} border-0`}
                        >
                          {job.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Candidates */}
            <Card className={`${cardBase} ${cardHover}`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    Recent Candidates
                  </CardTitle>
                  <CardDescription>
                    Latest applications and their status
                  </CardDescription>
                </div>
                <Link to="/candidates">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCandidates.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No candidates found
                    </p>
                  ) : (
                    recentCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {candidate.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {candidate.email}
                          </p>
                        </div>
                        <Badge
                          className={`${getStageColor(candidate.stage)} border-0`}
                        >
                          {candidate.stage}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6 lg:space-y-4 lg:flex lg:flex-col lg:w-64">
          {/* Timer */}
          <Card
            className={`h-32 flex flex-col items-center justify-center text-white rounded-xl ${cardHover}`}
            style={{
              background:
                "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            }}
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6" />
              <CardTitle className="text-lg">Current Time</CardTitle>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {time.toLocaleTimeString()}
            </p>
            <p className="text-sm mt-1">{time.toDateString()}</p>
          </Card>

          {/* Calendar */}
          <Card className={`${cardBase} ${cardHover}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                <span>Calendar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                className="rounded-lg overflow-hidden"
                value={date}
                onChange={setDate}
                tileClassName={({ date: tileDate }) =>
                  tileDate.toDateString() === date.toDateString()
                    ? "bg-indigo-100 text-indigo-700 font-semibold rounded-full"
                    : ""
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className={`${cardBase} ${cardHover}`}>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/jobs/create">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <Plus className="w-5 h-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Create Job</div>
                  <div className="text-xs text-gray-500">
                    Post a new position
                  </div>
                </div>
              </Button>
            </Link>
            <Link to="/candidates">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <Users className="w-5 h-5 mr-3 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Review Candidates</div>
                  <div className="text-xs text-gray-500">
                    Check applic2ations
                  </div>
                </div>
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
            >
              <CalendarIcon className="w-5 h-5 mr-3 text-purple-600" />
              <div className="text-left">
                <div className="font-medium">Schedule Interviews</div>
                <div className="text-xs text-gray-500">Plan meetings</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
            >
              <BarChart3 className="w-5 h-5 mr-3 text-orange-600" />
              <div className="text-left">
                <div className="font-medium">View Reports</div>
                <div className="text-xs text-gray-500">Analyze metrics</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
