"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Shield, Calendar, AlertTriangle, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import AddInsuranceDialog from "@/components/dashboard/add-insurance-dialog"

const insuranceTypes = [
  { value: "health", label: "Health", icon: "🏥", color: "green" },
  { value: "life", label: "Life", icon: "❤️", color: "red" },
  { value: "vehicle", label: "Vehicle", icon: "🚗", color: "blue" },
  { value: "home", label: "Home", icon: "🏠", color: "purple" },
  { value: "other", label: "Other", icon: "📋", color: "gray" },
]

export default function InsurancePage() {
  const [insurances, setInsurances] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    fetchInsurances()
  }, [])

  const fetchInsurances = async () => {
    try {
      const response = await fetch("/api/insurance")
      if (response.ok) {
        const data = await response.json()
        setInsurances(data)
      }
    } catch (error) {
      console.error("Error fetching insurance policies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddInsurance = async (data: any) => {
    try {
      const response = await fetch("/api/insurance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchInsurances()
        setShowAddDialog(false)
      }
    } catch (error) {
      console.error("Error adding insurance policy:", error)
    }
  }

  // Calculate totals and insights
  const totalSumAssured = insurances.reduce((total, insurance) => total + insurance.sumAssured, 0)
  const totalAnnualPremium = insurances.reduce((total, insurance) => {
    const multiplier =
      {
        monthly: 12,
        quarterly: 4,
        "half-yearly": 2,
        yearly: 1,
      }[insurance.premiumFrequency] || 1
    return total + insurance.premium * multiplier
  }, 0)

  // Calculate upcoming premiums (next 30 days)
  const upcomingPremiums = insurances
    .filter((insurance) => {
      const dueDate = new Date(insurance.nextDueDate)
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      return dueDate >= today && dueDate <= thirtyDaysFromNow
    })
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())

  const upcomingPremiumAmount = upcomingPremiums.reduce((total, insurance) => total + insurance.premium, 0)

  // Calculate expiring policies (next 90 days)
  const expiringPolicies = insurances.filter((insurance) => {
    const endDate = new Date(insurance.endDate)
    const today = new Date()
    const ninetyDaysFromNow = new Date()
    ninetyDaysFromNow.setDate(today.getDate() + 90)
    return endDate >= today && endDate <= ninetyDaysFromNow
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-400">Loading insurance policies...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Insurance Management</h1>
          <p className="text-gray-400">Manage your family's insurance policies and coverage</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Policy
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Coverage</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSumAssured)}</p>
                <p className="text-xs text-gray-400">{insurances.length} policies</p>
              </div>
              <div className="rounded-full bg-blue-900/20 p-2">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Annual Premium</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAnnualPremium)}</p>
                <p className="text-xs text-gray-400">Per year</p>
              </div>
              <div className="rounded-full bg-green-900/20 p-2">
                <Calendar className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Upcoming Premiums</p>
                <p className="text-2xl font-bold">{formatCurrency(upcomingPremiumAmount)}</p>
                <p className="text-xs text-gray-400">{upcomingPremiums.length} due in 30 days</p>
              </div>
              <div className="rounded-full bg-yellow-900/20 p-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Expiring Soon</p>
                <p className="text-2xl font-bold">{expiringPolicies.length}</p>
                <p className="text-xs text-gray-400">In next 90 days</p>
              </div>
              <div className="rounded-full bg-red-900/20 p-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Premiums Alert */}
      {upcomingPremiums.length > 0 && (
        <Card className="mb-6 border-yellow-500/50 bg-yellow-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <CardTitle className="text-yellow-400">Upcoming Premium Payments</CardTitle>
            </div>
            <CardDescription>You have {upcomingPremiums.length} premium(s) due in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingPremiums.slice(0, 3).map((insurance) => (
                <div
                  key={insurance._id}
                  className="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-yellow-900/10 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {insuranceTypes.find((type) => type.value === insurance.type)?.icon || "📋"}
                    </span>
                    <div>
                      <p className="font-medium">{insurance.provider}</p>
                      <p className="text-xs text-gray-400">{insurance.type} insurance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-yellow-400">{formatCurrency(insurance.premium)}</p>
                    <p className="text-xs text-gray-400">Due {formatDate(insurance.nextDueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insurance Policies Grid */}
      {insurances.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {insurances.map((insurance, index) => {
            const typeInfo = insuranceTypes.find((type) => type.value === insurance.type) || insuranceTypes[4]
            const dueDate = new Date(insurance.nextDueDate)
            const today = new Date()
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            const isDueSoon = daysUntilDue <= 30 && daysUntilDue >= 0
            const isOverdue = daysUntilDue < 0

            const endDate = new Date(insurance.endDate)
            const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry >= 0

            return (
              <motion.div
                key={insurance._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`border-gray-800 bg-black/50 hover:border-blue-500/50 transition-all duration-300 ${
                    isOverdue ? "border-red-500/50" : isDueSoon ? "border-yellow-500/50" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full bg-${typeInfo.color}-900/20 p-3 text-2xl`}>{typeInfo.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{insurance.provider}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {typeInfo.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {insurance.premiumFrequency}
                            </Badge>
                            {isDueSoon && (
                              <Badge variant="destructive" className="text-xs">
                                Due Soon
                              </Badge>
                            )}
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                            {isExpiringSoon && (
                              <Badge variant="outline" className="text-xs border-orange-500 text-orange-400">
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Policy Number</p>
                          <p className="font-medium text-sm">{insurance.policyNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Sum Assured</p>
                          <p className="font-medium text-sm">{formatCurrency(insurance.sumAssured)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Premium</p>
                          <p className="font-medium text-sm">{formatCurrency(insurance.premium)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Next Due</p>
                          <p className={`font-medium text-sm ${isDueSoon || isOverdue ? "text-red-400" : ""}`}>
                            {formatDate(insurance.nextDueDate, "medium")}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-800">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-gray-400">Start Date</p>
                            <p>{formatDate(insurance.startDate, "medium")}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">End Date</p>
                            <p className={isExpiringSoon ? "text-orange-400" : ""}>
                              {formatDate(insurance.endDate, "medium")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <Card className="border-gray-800 bg-black/50">
          <CardContent className="py-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-400 mb-4">No insurance policies found</p>
            <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Policy
            </Button>
          </CardContent>
        </Card>
      )}

      <AddInsuranceDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSubmit={handleAddInsurance} />
    </motion.div>
  )
}
