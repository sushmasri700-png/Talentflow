import { LogOut, Menu, Search, User, Settings, PanelRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ThemeToggle from "./ThemeToggle"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom"

export default function Navbar({ collapsed, onDesktopToggle, onMobileOpen }) {
  const navigate = useNavigate()

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      onMobileOpen() // open mobile drawer
    } else {
      onDesktopToggle()
    }
  }

  const handleNavigateCreateJob = () => {
    navigate("/job/create")
  }

  return (
    <header className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 z-10">
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMenuClick}
          className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <PanelRight className="w-16 h-16" />
        </Button>

        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs, title or status..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-gray-500 dark:focus:border-gray-400 focus:ring-0"
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3 md:gap-6 ml-3 pr-1 md:pr-8">
        

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer border border-gray-300 dark:border-gray-600 w-9 h-9 hover:ring-1 hover:ring-gray-400 dark:hover:ring-gray-500">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-2 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="font-semibold">John Doe</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                john.doe@example.com
              </p>
            </div>

            {/* Menu Links */}
            <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
              <User className="w-4 h-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
              <LogOut className="w-4 h-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
