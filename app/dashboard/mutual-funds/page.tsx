"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDate, calculateHoldingPeriod } from "@/lib/utils"
import AddMutualFundDialog from "@/components/dashboard/add-mutual-fund-dialog"
import EditMutualFundDialog from "@/components/dashboard/edit-mutual-fund-dialog"
import AIAssistant from "@/components/dashboard/ai-assistant"

interface MutualFund {
  _id: string
  schemeName: string
  amc: string
  tradingsymbol: string
  schemeType: string
  plan: string
  quantity: number
  buyingPrice: number
  purchaseDate: string
  currentValue?: number
  lastPrice?: number
  lastPriceDate?: string
}

export default function MutualFundsPage() {
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([])
  const [filteredFunds, setFilteredFunds] = useState<MutualFund[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchMutualFunds()
  }, [])

  useEffect(() => {
    // Filter mutual funds based on search query
    if (searchQuery.trim() === "") {
      setFilteredFunds(mutualFunds)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = mutualFunds.filter(
        (fund) =>
          fund.schemeName.toLowerCase().includes(query) ||
          fund.amc.toLowerCase().includes(query) ||
          fund.tradingsymbol.toLowerCase().includes(query) ||
          fund.schemeType.toLowerCase().includes(query),
      )
      setFilteredFunds(filtered)
    }
  }, [searchQuery, mutualFunds])

  const fetchMutualFunds = async () => {
    try {
      const response = await fetch("/api/mutual-funds")
      if (response.ok) {
        const data = await response.json()
        setMutualFunds(data)
        setFilteredFunds(data)
      }
    } catch (error) {
      console.error("Error fetching mutual funds:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMutualFund = async (data: any) => {
    try {
      const response = await fetch("/api/mutual-funds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchMutualFunds()
        setShowAddDialog(false)
      }
    } catch (error) {
      console.error("Error adding mutual fund:", error)
    }
  }

  const handleEditMutualFund = async (data: Partial<MutualFund>) => {
    try {
      const response = await fetch(`/api/mutual-funds/${data._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchMutualFunds()
        setShowEditDialog(false)
        setSelectedFund(null)
      }
    } catch (error) {
      console.error("Error updating mutual fund:", error)
    }
  }

  const handleDeleteMutualFund = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this holding?")) {
      try {
        const response = await fetch(`/api/mutual-funds/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchMutualFunds()
        }
      } catch (error) {
        console.error("Error deleting mutual fund:", error)
      }
    }
  }

  // Calculate totals for filtered funds
  const totalInvestment = filteredFunds.reduce((total, fund) => total + fund.buyingPrice * fund.quantity, 0)
  const totalCurrentValue = filteredFunds.reduce((total, fund) => total + (fund.currentValue || 0), 0)
  const totalProfitLoss = totalCurrentValue - totalInvestment
  const profitLossPercentage = totalInvestment > 0 ? ((totalProfitLoss / totalInvestment) * 100).toFixed(2) : "0.00"

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-400">Loading mutual funds...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mutual Fund Holdings</h1>
          <p className="text-gray-400">Track your mutual fund investments and performance</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Holding
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search holdings by name, AMC, or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-800 bg-black/50"
          />
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-400">
            Showing {filteredFunds.length} of {mutualFunds.length} holdings
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Investment</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInvestment)}</p>
                <p className="text-xs text-gray-400">{filteredFunds.length} holdings</p>
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
                <p className="text-sm text-gray-400">Current Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCurrentValue)}</p>
              </div>
              <div className="rounded-full bg-green-900/20 p-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total P&L</p>
                <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalProfitLoss >= 0 ? "+" : ""}
                  {formatCurrency(totalProfitLoss)}
                </p>
                <p className={`text-xs ${totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                  ({profitLossPercentage}%)
                </p>
              </div>
              <div className={`rounded-full p-2 ${totalProfitLoss >= 0 ? "bg-green-900/20" : "bg-red-900/20"}`}>
                {totalProfitLoss >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card className="border-gray-800 bg-black/50">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Your mutual fund portfolio details</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFunds.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-xs">
                    <th className="pb-3 font-medium">Scheme Details</th>
                    <th className="pb-3 font-medium">Units</th>
                    <th className="pb-3 font-medium">Avg. Price</th>
                    <th className="pb-3 font-medium">Current NAV</th>
                    <th className="pb-3 font-medium">Investment</th>
                    <th className="pb-3 font-medium">Current Value</th>
                    <th className="pb-3 font-medium">P&L</th>
                    <th className="pb-3 font-medium">Holding Period</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFunds.map((fund) => {
                    const investedAmount = fund.buyingPrice * fund.quantity
                    const currentValue = fund.currentValue || investedAmount
                    const profitLoss = currentValue - investedAmount
                    const profitLossPercentage =
                      investedAmount > 0 ? ((profitLoss / investedAmount) * 100).toFixed(2) : "0.00"
                    const { isLongTerm } = calculateHoldingPeriod(new Date(fund.purchaseDate))

                    return (
                      <motion.tr
                        key={fund._id}
                        className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="py-4">
                          <div>
                            <p className="font-medium">{fund.schemeName}</p>
                            <p className="text-xs text-gray-400">{fund.amc}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {fund.schemeType}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {fund.plan}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400 font-mono mt-1">{fund.tradingsymbol}</p>
                          </div>
                        </td>
                        <td className="py-4 font-mono">{fund.quantity.toFixed(3)}</td>
                        <td className="py-4">{formatCurrency(fund.buyingPrice)}</td>
                        <td className="py-4">
                          <div>
                            <p>{formatCurrency(fund.lastPrice || fund.buyingPrice)}</p>
                            <p className="text-xs text-gray-400">
                              {formatDate(fund.lastPriceDate || fund.purchaseDate)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4">{formatCurrency(investedAmount)}</td>
                        <td className="py-4 font-medium">{formatCurrency(currentValue)}</td>
                        <td className={`py-4 ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                          <div>
                            <p className="font-medium">
                              {profitLoss >= 0 ? "+" : ""}
                              {formatCurrency(profitLoss)}
                            </p>
                            <p className="text-xs">({profitLossPercentage}%)</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant={isLongTerm ? "default" : "secondary"}>
                            {isLongTerm ? "Long Term" : "Short Term"}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedFund(fund)
                                setShowEditDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-300"
                              onClick={() => handleDeleteMutualFund(fund._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              {searchQuery ? (
                <div>
                  <p className="text-gray-400 mb-2">No holdings found matching "{searchQuery}"</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")} className="mr-2">
                    Clear Search
                  </Button>
                  <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Holding
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-4">No mutual fund holdings found</p>
                  <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Holding
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddMutualFundDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSubmit={handleAddMutualFund} />
      <EditMutualFundDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleEditMutualFund}
        mutualFund={selectedFund}
      />
      <AIAssistant
        mutualFunds={filteredFunds}
        portfolioStats={{
          totalInvestment,
          totalCurrentValue,
          totalProfitLoss,
          profitLossPercentage,
        }}
      />
    </motion.div>
  )
}
