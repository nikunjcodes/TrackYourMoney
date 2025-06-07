"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Calendar, TrendingDown, TrendingUp, PieChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/utils"
import AddExpenseDialog from "@/components/dashboard/add-expense-dialog"
import ExpenseChart from "@/components/dashboard/expense-chart"

const expenseCategories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Investment",
  "Other",
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses")
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error("Error fetching expenses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExpense = async (data: any) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchExpenses()
        setShowAddDialog(false)
      }
    } catch (error) {
      console.error("Error adding expense:", error)
    }
  }

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const categoryMatch = selectedCategory === "all" || expense.category === selectedCategory
    const monthMatch = selectedMonth === "all" || new Date(expense.date).getMonth() === Number.parseInt(selectedMonth)
    return categoryMatch && monthMatch
  })

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0)
  const currentMonth = new Date().getMonth()
  const currentMonthExpenses = expenses
    .filter((expense) => new Date(expense.date).getMonth() === currentMonth)
    .reduce((total, expense) => total + expense.amount, 0)

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthExpenses = expenses
    .filter((expense) => new Date(expense.date).getMonth() === lastMonth)
    .reduce((total, expense) => total + expense.amount, 0)

  const monthlyChange =
    lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0

  // Category breakdown
  const categoryTotals = expenseCategories
    .map((category) => {
      const categoryExpenses = filteredExpenses.filter((expense) => expense.category === category)
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      return { category, total, count: categoryExpenses.length }
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-400">Loading expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expense Tracker</h1>
          <p className="text-gray-400">Monitor and analyze your spending patterns</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(currentMonthExpenses)}</p>
                <div
                  className={`flex items-center gap-1 text-xs ${monthlyChange >= 0 ? "text-red-500" : "text-green-500"}`}
                >
                  {monthlyChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(monthlyChange).toFixed(1)}% from last month
                </div>
              </div>
              <div className="rounded-full bg-blue-900/20 p-2">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Filtered</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                <p className="text-xs text-gray-400">{filteredExpenses.length} transactions</p>
              </div>
              <div className="rounded-full bg-green-900/20 p-2">
                <TrendingDown className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Top Category</p>
                <p className="text-lg font-bold">{categoryTotals[0]?.category || "N/A"}</p>
                <p className="text-xs text-gray-400">
                  {categoryTotals[0] ? formatCurrency(categoryTotals[0].total) : "₹0"}
                </p>
              </div>
              <div className="rounded-full bg-purple-900/20 p-2">
                <PieChart className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Filters and Expenses List */}
        <div className="lg:col-span-2">
          <Card className="border-gray-800 bg-black/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>Track your spending history</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40 border-gray-800 bg-black/50">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-800 bg-black">
                      <SelectItem value="all">All Categories</SelectItem>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32 border-gray-800 bg-black/50">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-800 bg-black">
                      <SelectItem value="all">All Months</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {new Date(2024, i).toLocaleDateString("en-US", { month: "long" })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredExpenses.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredExpenses.map((expense) => (
                    <motion.div
                      key={expense._id}
                      className="flex items-center justify-between rounded-lg border border-gray-800 p-4 hover:bg-gray-900/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-900/20 p-2">
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium">{expense.description || expense.category}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Badge variant="outline" className="text-xs">
                              {expense.category}
                            </Badge>
                            <span>{formatDate(expense.date)}</span>
                            <span>•</span>
                            <span>{expense.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-400">-{formatCurrency(expense.amount)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-400">No expenses found for the selected filters</p>
                  <Button onClick={() => setShowAddDialog(true)} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Expense
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown and Chart */}
        <div className="space-y-6">
          <Card className="border-gray-800 bg-black/50">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Your expense distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryTotals.slice(0, 5).map((item, index) => {
                  const percentage = totalExpenses > 0 ? (item.total / totalExpenses) * 100 : 0
                  return (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{item.category}</span>
                        <span className="font-medium">{formatCurrency(item.total)}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                        <motion.div
                          className="h-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{item.count} transactions</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-black/50">
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
              <CardDescription>Expense pattern over time</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ExpenseChart expenses={expenses} />
            </CardContent>
          </Card>
        </div>
      </div>

      <AddExpenseDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSubmit={handleAddExpense} />
    </motion.div>
  )
}
