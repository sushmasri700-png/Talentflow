import {
  Home,
  Briefcase,
  Users,
  ClipboardList,
  FileText,
} from "lucide-react"

import clsx from "clsx"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Sidebar({ collapsed = false, mobile = false, onClose }) {
  const sidebarLinks = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Briefcase, label: "Jobs", href: "/jobs" },
  { icon: Users, label: "Candidates", href: "/candidates" },
  { icon: ClipboardList, label: "Assessments", href: "/assessment" },
]
  return (
    <aside
      className={clsx(
        "bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 flex-col transition-[width] duration-300 ease-in-out h-full fixed md:relative z-40",
        mobile ? "flex w-64" : collapsed ? "w-20 hidden md:flex" : "w-64 hidden md:flex"
      )}
    >
      {/* Header with Logo + Title + Close (only in mobile) */}
      <div
        className={clsx(
          "flex items-center justify-between p-4 transition-all duration-300 ease-in-out border-gray-200 dark:border-gray-700",
          collapsed && !mobile ? "justify-center" : "gap-2"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center shrink-0 border border-gray-300 dark:border-gray-600">
            <span className="text-xs font-bold">TF</span>
          </div>
          {(!collapsed || mobile) && (
            <h2 className="text-lg font-bold transition-opacity duration-300">
              Talent Flow
            </h2>
          )}
        </div>

        {/* Cross button only for mobile */}
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Nav links */}
       <nav className="flex-1 mt-4 space-y-1">
      {sidebarLinks.map(({ icon: Icon, label, href }) => (
        <Link
          key={label}
          to={href}
          className={clsx(
            "flex items-center rounded text-sm transition-all duration-300 ease-in-out",
            collapsed && !mobile
              ? "flex-col gap-1 align-center text-xs w-fit mx-auto justify-center p-3 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              : "gap-3 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <Icon className="w-5 h-5" />
          {(!collapsed || mobile) && <span>{label}</span>}
        </Link>
      ))}
    </nav>
    </aside>
  )
}
