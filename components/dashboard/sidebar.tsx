"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  BarChart3,
  CreditCard,
  Home,
  LineChart,
  LogOut,
  PieChart,
  Settings,
  Shield,
  Target,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"

type SidebarProps = {
  user: {
    id: string
    name: string
    email: string
  }
}

export default function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Mutual Funds",
      href: "/dashboard/mutual-funds",
      icon: PieChart,
    },
    {
      name: "SIP Management",
      href: "/dashboard/sip",
      icon: LineChart,
    },
    {
      name: "Portfolio History",
      href: "/dashboard/portfolio",
      icon: BarChart3,
    },
    {
      name: "Insurance",
      href: "/dashboard/insurance",
      icon: Shield,
    },
    {
      name: "Expenses",
      href: "/dashboard/expenses",
      icon: CreditCard,
    },
    {
      name: "Goals",
      href: "/dashboard/goals",
      icon: Target,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  return (
    <motion.div
      className={cn(
        "flex h-screen flex-col border-r border-gray-800 bg-black transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-8 w-8 text-blue-400" />
          {!isCollapsed && <span className="text-xl font-bold">TrackYourMoney</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 rounded-full"
        >
          {isCollapsed ? "→" : "←"}
        </Button>
      </div>

      <div className="flex flex-1 flex-col justify-between py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                pathname === item.href
                  ? "bg-blue-900/20 text-blue-400"
                  : "text-gray-400 hover:bg-gray-900 hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="px-2">
          <div className="mb-2 rounded-md border border-gray-800 p-3">
            {!isCollapsed && (
              <div className="mb-2">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "default"}
              onClick={handleLogout}
              className={cn(
                "w-full justify-start text-gray-400 hover:bg-gray-900 hover:text-white",
                isCollapsed && "flex h-10 w-10 items-center justify-center p-0",
              )}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
