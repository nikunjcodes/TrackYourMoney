import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import DashboardSidebar from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-black text-white">
      <DashboardSidebar user={session} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
