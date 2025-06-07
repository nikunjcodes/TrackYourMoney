"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, Calendar, CreditCard, DollarSign, PieChart, Shield, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatDate } from "@/lib/utils"
import PortfolioChart from "@/components/dashboard/portfolio-chart"

export default function DashboardOverview({
  user,
  mutualFunds,
  sips,
  insurances,
  expenses,
  goals,
  totalPortfolioValue,
  totalMonthlyExpenses,
}) {
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate total investment
  const totalInvestment = mutualFunds.reduce((total, fund) => total + fund.buyingPrice * fund.quantity, 0)

  // Calculate total profit/loss
  const totalProfitLoss = totalPortfolioValue - totalInvestment
  const profitLossPercentage = totalInvestment > 0 ? ((totalProfitLoss / totalInvestment) * 100).toFixed(2) : "0.00"

  // Calculate total upcoming SIPs
  const totalUpcomingSIPs = sips.reduce((total, sip) => total + sip.amount, 0)

  // Calculate total upcoming insurance premiums
  const totalUpcomingPremiums = insurances.reduce((total, insurance) => total + insurance.premium, 0)

  // Calculate progress towards goals
  const totalGoalAmount = goals.reduce((total, goal) => total + goal.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((total, goal) => total + goal.currentAmount, 0)
  const goalProgress = totalGoalAmount > 0 ? (totalCurrentAmount / totalGoalAmount) * 100 : 0

  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
          <p className="text-gray-400">Here's an overview of your finances</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">{formatDate(new Date(), "full")}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Portfolio Value"
          value={formatCurrency(totalPortfolioValue)}
          description={
            totalProfitLoss >= 0
              ? `+${formatCurrency(totalProfitLoss)} (${profitLossPercentage}%)`
              : `-${formatCurrency(Math.abs(totalProfitLoss))} (${profitLossPercentage}%)`
          }
          icon={<PieChart className="h-5 w-5" />}
          trend={totalProfitLoss >= 0 ? "up" : "down"}
        />

        <StatsCard
          title="Monthly Expenses"
          value={formatCurrency(totalMonthlyExpenses)}
          description="This month"
          icon={<CreditCard className="h-5 w-5" />}
        />

        <StatsCard
          title="Upcoming SIPs"
          value={formatCurrency(totalUpcomingSIPs)}
          description={`${sips.length} SIPs in next 30 days`}
          icon={<Calendar className="h-5 w-5" />}
        />

        <StatsCard
          title="Insurance Premiums"
          value={formatCurrency(totalUpcomingPremiums)}
          description={`${insurances.length} premiums due soon`}
          icon={<Shield className="h-5 w-5" />}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-gray-800 bg-black/50">
              <CardHeader>
                <CardTitle>Portfolio History</CardTitle>
                <CardDescription>Your portfolio value over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <PortfolioChart />
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-black/50">
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <div key={expense._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-gray-800 p-2">
                            <DollarSign className="h-4 w-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{expense.description || expense.category}</p>
                            <p className="text-xs text-gray-400">{formatDate(expense.date)}</p>
                          </div>
                        </div>
                        <p className="font-medium text-red-400">-{formatCurrency(expense.amount)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400">No recent expenses</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card className="border-gray-800 bg-black/50">
              <CardHeader>
                <CardTitle>Upcoming SIPs</CardTitle>
                <CardDescription>SIPs due in the next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sips.length > 0 ? (
                    sips.slice(0, 3).map((sip) => (
                      <div key={sip._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{sip.schemeName}</p>
                          <p className="text-xs text-gray-400">Due on {formatDate(sip.nextExecutionDate)}</p>
                        </div>
                        <p className="font-medium text-blue-400">{formatCurrency(sip.amount)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400">No upcoming SIPs</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-black/50">
              <CardHeader>
                <CardTitle>Insurance Premiums</CardTitle>
                <CardDescription>Premiums due in the next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insurances.length > 0 ? (
                    insurances.slice(0, 3).map((insurance) => (
                      <div key={insurance._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {insurance.provider} ({insurance.type})
                          </p>
                          <p className="text-xs text-gray-400">Due on {formatDate(insurance.nextDueDate)}</p>
                        </div>
                        <p className="font-medium text-blue-400">{formatCurrency(insurance.premium)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400">No upcoming premiums</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investments" className="mt-6">
          <Card className="border-gray-800 bg-black/50">
            <CardHeader>
              <CardTitle>Mutual Fund Holdings</CardTitle>
              <CardDescription>Your current mutual fund portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-xs">
                      <th className="pb-2 font-medium">Scheme Name</th>
                      <th className="pb-2 font-medium">Units</th>
                      <th className="pb-2 font-medium">Buying Price</th>
                      <th className="pb-2 font-medium">Current Price</th>
                      <th className="pb-2 font-medium">Current Value</th>
                      <th className="pb-2 font-medium">P&L</th>
                      <th className="pb-2 font-medium">Holding Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mutualFunds.length > 0 ? (
                      mutualFunds.map((fund) => {
                        const investedAmount = fund.buyingPrice * fund.quantity
                        const currentValue = fund.currentValue || investedAmount
                        const profitLoss = currentValue - investedAmount
                        const profitLossPercentage =
                          investedAmount > 0 ? ((profitLoss / investedAmount) * 100).toFixed(2) : "0.00"

                        // Calculate holding period
                        const purchaseDate = new Date(fund.purchaseDate)
                        const today = new Date()
                        const holdingPeriodDays = Math.floor(
                          (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24),
                        )
                        const isLongTerm = holdingPeriodDays > 365

                        return (
                          <tr key={fund._id} className="border-b border-gray-800">
                            <td className="py-3">
                              <div>
                                <p className="font-medium">{fund.schemeName}</p>
                                <p className="text-xs text-gray-400">{fund.amc}</p>
                              </div>
                            </td>
                            <td className="py-3">{fund.quantity.toFixed(3)}</td>
                            <td className="py-3">{formatCurrency(fund.buyingPrice)}</td>
                            <td className="py-3">{formatCurrency(fund.lastPrice || fund.buyingPrice)}</td>
                            <td className="py-3">{formatCurrency(currentValue)}</td>
                            <td className={`py-3 ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {profitLoss >= 0 ? "+" : ""}
                              {formatCurrency(profitLoss)} ({profitLossPercentage}%)
                            </td>
                            <td className={`py-3 ${isLongTerm ? "text-green-500" : "text-yellow-500"}`}>
                              {isLongTerm ? "Long Term" : "Short Term"}
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-gray-400">
                          No mutual funds found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <Card className="border-gray-800 bg-black/50">
            <CardHeader>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>Track your progress towards financial goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Overall Progress</p>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(totalCurrentAmount)} of {formatCurrency(totalGoalAmount)}
                  </p>
                </div>
                <p className="text-sm font-medium">{goalProgress.toFixed(1)}%</p>
              </div>
              <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                <div className="h-full bg-blue-500" style={{ width: `${Math.min(goalProgress, 100)}%` }} />
              </div>

              <div className="space-y-6">
                {goals.length > 0 ? (
                  goals.map((goal) => {
                    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0

                    return (
                      <div key={goal._id}>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="font-medium">{goal.name}</p>
                              <p className="text-xs text-gray-400">Target: {formatDate(goal.targetDate, "medium")}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{progress.toFixed(1)}%</p>
                            <p className="text-xs text-gray-400">
                              {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                          <div className="h-full bg-blue-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-gray-400">No financial goals found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

function StatsCard({ title, value, description, icon, trend }) {
  return (
    <Card className="border-gray-800 bg-black/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="rounded-full bg-blue-900/20 p-2">{icon}</div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
              {trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {description}
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {!trend && <p className="text-xs text-gray-400">{description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
