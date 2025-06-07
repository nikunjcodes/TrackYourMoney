"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Play, Pause, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import AddSIPDialog from "@/components/dashboard/add-sip-dialog"

export default function SIPPage() {
  const [sips, setSips] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  useEffect(() => {
    fetchSIPs()
  }, [])

  const fetchSIPs = async () => {
    try {
      const response = await fetch("/api/sip")
      if (response.ok) {
        const data = await response.json()
        setSips(data)
      }
    } catch (error) {
      console.error("Error fetching SIPs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSIP = async (data: any) => {
    try {
      const response = await fetch("/api/sip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchSIPs()
        setShowAddDialog(false)
      }
    } catch (error) {
      console.error("Error adding SIP:", error)
    }
  }

  const handleExecuteSIPs = async () => {
    setIsExecuting(true)
    try {
      const response = await fetch("/api/sip/execute", {
        method: "POST",
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Successfully executed ${result.executed} SIPs`)
        fetchSIPs()
      }
    } catch (error) {
      console.error("Error executing SIPs:", error)
      alert("Failed to execute SIPs")
    } finally {
      setIsExecuting(false)
    }
  }

  // Calculate totals
  const totalSIPAmount = sips.reduce((total, sip) => total + sip.amount, 0)
  const activeSIPs = sips.filter((sip) => sip.active).length
  const upcomingSIPs = sips.filter((sip) => {
    const executionDate = new Date(sip.nextExecutionDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    return executionDate >= today && executionDate <= thirtyDaysFromNow
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-400">Loading SIPs...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SIP Management</h1>
          <p className="text-gray-400">Manage your systematic investment plans</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExecuteSIPs}
            disabled={isExecuting}
            variant="outline"
            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
          >
            <Play className="mr-2 h-4 w-4" />
            {isExecuting ? "Executing..." : "Execute Due SIPs"}
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add SIP
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Monthly SIP</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSIPAmount)}</p>
              </div>
              <div className="rounded-full bg-blue-900/20 p-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active SIPs</p>
                <p className="text-2xl font-bold">{activeSIPs}</p>
              </div>
              <div className="rounded-full bg-green-900/20 p-2">
                <Play className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Upcoming (30 days)</p>
                <p className="text-2xl font-bold">{upcomingSIPs.length}</p>
              </div>
              <div className="rounded-full bg-yellow-900/20 p-2">
                <Calendar className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SIPs Table */}
      <Card className="border-gray-800 bg-black/50">
        <CardHeader>
          <CardTitle>Your SIPs</CardTitle>
          <CardDescription>Systematic Investment Plans and their schedules</CardDescription>
        </CardHeader>
        <CardContent>
          {sips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-xs">
                    <th className="pb-3 font-medium">Scheme Name</th>
                    <th className="pb-3 font-medium">SIP Amount</th>
                    <th className="pb-3 font-medium">Frequency</th>
                    <th className="pb-3 font-medium">Start Date</th>
                    <th className="pb-3 font-medium">Next Execution</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sips.map((sip) => {
                    const nextExecutionDate = new Date(sip.nextExecutionDate)
                    const today = new Date()
                    const isDue = nextExecutionDate <= today

                    return (
                      <tr key={sip._id} className="border-b border-gray-800">
                        <td className="py-4">
                          <div>
                            <p className="font-medium">{sip.schemeName}</p>
                            <p className="text-xs text-gray-400">{sip.tradingsymbol}</p>
                          </div>
                        </td>
                        <td className="py-4 font-medium">{formatCurrency(sip.amount)}</td>
                        <td className="py-4">
                          <Badge variant="outline">
                            {sip.frequency.charAt(0).toUpperCase() + sip.frequency.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4">{formatDate(sip.startDate, "medium")}</td>
                        <td className="py-4">
                          <div>
                            <p className={isDue ? "text-red-400" : ""}>{formatDate(sip.nextExecutionDate, "medium")}</p>
                            {isDue && <p className="text-xs text-red-400">Due for execution</p>}
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant={sip.active ? "default" : "secondary"}>
                            {sip.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              {sip.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-400">No SIPs found</p>
              <Button onClick={() => setShowAddDialog(true)} className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First SIP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddSIPDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSubmit={handleAddSIP} />
    </motion.div>
  )
}
