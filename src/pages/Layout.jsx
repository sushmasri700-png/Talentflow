import React, { useState } from "react"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
 
export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)    // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false)  // mobile drawer
 
  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar collapsed={collapsed} />
      </div>
 
      {/* Mobile sidebar in a drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar
            mobile={true}
            collapsed={false}   // always expanded on mobile
            onClose={() => setMobileOpen(false)} // close when X clicked
          />
        </SheetContent>
      </Sheet>
 
      {/* Main area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        <Navbar
          collapsed={collapsed}
          onDesktopToggle={() => setCollapsed(prev => !prev)}
          onMobileOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  )
}