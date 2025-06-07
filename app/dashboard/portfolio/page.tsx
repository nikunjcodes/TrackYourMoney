"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import PortfolioChart from "@/components/dashboard/portfolio-chart"
import AssetAllocationChart from "@/components/dashboard/asset-allocation-chart"

export default function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState([])
  const [mutualFunds, setMutualFunds] = useState([])
  const [timeRange, setTimeRange] = useState("1Y")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioData()
    fetchMutualFunds()
  }, [])

  const fetchPortfolioData = async () => {
    try {
      // In a real app, this would fetch from your portfolio history API
      // For now, we'll generate sample data
      const sampleData = generateSamplePortfolioData()
      setPortfolioData(sampleData)
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMutualFunds = async () => {
    try {
      const response = await fetch("/api/mutual-funds")
      if (response.ok) {
        const data = await response.json()
        setMutualFunds(data)
      }
    } catch (error) {
      console.error("Error fetching mutual funds:", error)
    }
  }

  const generateSamplePortfolioData = () => {
    const data = []
    const now = new Date()
    const periods = {
      "1M": 30,
      "3M": 90,
      "6M": 180,
      "1Y": 365,
      "3Y": 1095,
      "5Y": 1825,
    }

    const days = periods[timeRange] || 365
    const baseValue = 500000

    for (let i = days; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      // Generate realistic portfolio growth with some volatility
      const trend = ((days - i) / days) * 0.12 // 12% annual growth
      const volatility = (Math.random() - 0.5) * 0.02 // ±1% daily volatility
      const value = baseValue * (1 + trend + volatility)

      data.push({
        date: date.toISOString().split("T")[0],
        value: Math.round(value),
        mutualFunds: Math.round(value * 0.7),
        stocks: Math.round(value * 0.2),
        cash: Math.round(value * 0.1),
      })
    }

    return data
  }

  // Calculate portfolio metrics
  const currentValue = portfolioData.length > 0 ? portfolioData[portfolioData.length - 1]?.value || 0 : 0
  const previousValue = portfolioData.length > 1 ? portfolioData[portfolioData.length - 2]?.value || 0 : 0
  const totalInvestment = mutualFunds.reduce((total, fund) => total + fund.buyingPrice * fund.quantity, 0)
  const totalGainLoss = currentValue - totalInvestment
  const gainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0
  const dayChange = currentValue - previousValue
  const dayChangePercentage = previousValue > 0 ? (dayChange / previousValue) * 100 : 0

  // Asset allocation data
  const assetAllocation = [
    { name: "Mutual Funds", value: currentValue * 0.7, color: "#3B82F6" },
    { name: "Stocks", value: currentValue * 0.2, color: "#10B981" },
    { name: "Cash", value: currentValue * 0.1, color: "#F59E0B" },
  ]

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-400">Loading portfolio data...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio History</h1>
          <p className="text-gray-400">Track your investment performance over time</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 border-gray-800 bg-black/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-800 bg-black">
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
              <SelectItem value="6M">6 Months</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
              <SelectItem value="3Y">3 Years</SelectItem>
              <SelectItem value="5Y">5 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Portfolio Value</p>
                <p className="text-2xl font-bold">{formatCurrency(currentValue)}</p>
                <div
                  className={`flex items-center gap-1 text-xs ${dayChange >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {dayChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {dayChange >= 0 ? "+" : ""}
                  {formatCurrency(dayChange)} ({dayChangePercentage.toFixed(2)}%)
                </div>
              </div>
              <div className="rounded-full bg-blue-900/20 p-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Investment</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInvestment)}</p>
                <p className="text-xs text-gray-400">Principal amount</p>
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
                <p className="text-sm text-gray-400">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalGainLoss >= 0 ? "+" : ""}
                  {formatCurrency(totalGainLoss)}
                </p>
                <p className={`text-xs ${totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {gainLossPercentage.toFixed(2)}% return
                </p>
              </div>
              <div className={`rounded-full p-2 ${totalGainLoss >= 0 ? "bg-green-900/20" : "bg-red-900/20"}`}>
                {totalGainLoss >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Holdings</p>
                <p className="text-2xl font-bold">{mutualFunds.length}</p>
                <p className="text-xs text-gray-400">Active investments</p>
              </div>
              <div className="rounded-full bg-purple-900/20 p-2">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Portfolio Chart */}
        <div className="lg:col-span-2">
          <Card className="border-gray-800 bg-black/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>Your investment growth over {timeRange}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {["1M", "3M", "6M", "1Y", "3Y", "5Y"].map((period) => (
                    <Button
                      key={period}
                      variant={timeRange === period ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTimeRange(period)}
                      className="h-8 px-3 text-xs"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-96">
              <PortfolioChart data={portfolioData} />
            </CardContent>
          </Card>
        </div>

        {/* Asset Allocation */}
        <div className="space-y-6">
          <Card className="border-gray-800 bg-black/50">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Portfolio distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <AssetAllocationChart data={assetAllocation} />
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-black/50">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key portfolio statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">CAGR</span>
                  <span className="font-medium text-green-400">12.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Volatility</span>
                  <span className="font-medium">15.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Sharpe Ratio</span>
                  <span className="font-medium">0.82</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Max Drawdown</span>
                  <span className="font-medium text-red-400">-8.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Beta</span>
                  <span className="font-medium">0.95</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
