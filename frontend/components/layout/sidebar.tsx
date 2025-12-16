"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Settings, LogOut, GraduationCap } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Submissions",
      icon: FileText,
      href: "/submissions",
      active: pathname === "/submissions" || pathname.startsWith("/submissions/"),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900/50 backdrop-blur-xl border-r border-white/10 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Essay<span className="text-blue-500">Grader</span>
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
                route.active
                  ? "text-white bg-blue-600/10 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.active ? "text-blue-400" : "text-slate-500 group-hover:text-white")} />
                {route.label}
              </div>
              {route.active && (
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
              )}
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 mb-4">
          <h4 className="text-xs font-semibold text-slate-400 mb-1">Pro Plan</h4>
          <p className="text-xs text-slate-500 mb-3">Unlimited gradings</p>
          <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-[70%] bg-blue-500 rounded-full" />
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 rounded-xl">
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )
}
