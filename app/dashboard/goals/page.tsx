"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Target, Calendar, TrendingUp, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, formatDate } from "@/lib/utils"
import AddGoalDialog from "@/components/dashboard/add-goal-dialog"

const goalCategories = [
  { value: "education", label: "Education", color: "blue" },
  { value: "retirement", label: "Retirement", color: "green" },
  { value: "home", label: "Home", color: "purple" },
  { value: "vehicle", label: "Vehicle", color: "orange" },
  { value: "travel", label: "Travel", color: "cyan" },
  { value: "other", label: "Other", color: "gray" },
]

const priorityColors = {
  low: "gray",
  medium: "yellow",
  high: "red",
}

export default function GoalsPage() {
  const [goals, setGoals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals")
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddGoal = async (data: any) => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchGoals()
        setShowAddDialog(false)
      }
    } catch (error) {
      console.error("Error adding goal:", error)
    }
  }

  // Calculate totals
  const totalGoalAmount = goals.reduce((total, goal) => total + goal.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((total, goal) => total + goal.currentAmount, 0)
  const overallProgress = totalGoalAmount > 0 ? (totalCurrentAmount / totalGoalAmount) * 100 : 0

  const completedGoals = goals.filter((goal) => goal.currentAmount >= goal.targetAmount).length
  const activeGoals = goals.filter((goal) => goal.currentAmount < goal.targetAmount).length

  // Calculate time-based insights
  const urgentGoals = goals.filter((goal) => {
    const targetDate = new Date(goal.targetDate)
    const today = new Date()
    const daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilTarget <= 365 && goal.currentAmount < goal.targetAmount
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-400">Loading goals...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Goals</h1>
          <p className="text-gray-400">Track your progress towards financial milestones</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Overall Progress</p>
                <p className="text-2xl font-bold">{overallProgress.toFixed(1)}%</p>
                <p className="text-xs text-gray-400">
                  {formatCurrency(totalCurrentAmount)} of {formatCurrency(totalGoalAmount)}
                </p>
              </div>
              <div className="rounded-full bg-blue-900/20 p-2">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Goals</p>
                <p className="text-2xl font-bold">{activeGoals}</p>
                <p className="text-xs text-gray-400">In progress</p>
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
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold">{completedGoals}</p>
                <p className="text-xs text-gray-400">Achieved</p>
              </div>
              <div className="rounded-full bg-purple-900/20 p-2">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-black/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Urgent Goals</p>
                <p className="text-2xl font-bold">{urgentGoals.length}</p>
                <p className="text-xs text-gray-400">Due within 1 year</p>
              </div>
              <div className="rounded-full bg-red-900/20 p-2">
                <Calendar className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="mb-6 border-gray-800 bg-black/50">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>Your journey towards financial goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Progress</span>
              <span className="text-sm font-medium">{overallProgress.toFixed(1)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{formatCurrency(totalCurrentAmount)} achieved</span>
              <span>{formatCurrency(totalGoalAmount - totalCurrentAmount)} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal, index) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
            const isCompleted = progress >= 100
            const targetDate = new Date(goal.targetDate)
            const today = new Date()
            const daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            const isUrgent = daysUntilTarget <= 365 && !isCompleted

            const categoryInfo = goalCategories.find((cat) => cat.value === goal.category) || goalCategories[5]

            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`border-gray-800 bg-black/50 hover:border-blue-500/50 transition-all duration-300 ${isCompleted ? "border-green-500/50" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full bg-${categoryInfo.color}-900/20 p-2`}>
                          <Target className={`h-5 w-5 text-${categoryInfo.color}-400`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {categoryInfo.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs border-${priorityColors[goal.priority]}-500 text-${priorityColors[goal.priority]}-400`}
                            >
                              {goal.priority} priority
                            </Badge>
                            {isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
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
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{formatCurrency(goal.currentAmount)}</span>
                        <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-800">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Target Date</span>
                          <span className={`font-medium ${isUrgent ? "text-red-400" : ""}`}>
                            {formatDate(goal.targetDate, "medium")}
                          </span>
                        </div>
                        {!isCompleted && (
                          <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                            <span>Remaining</span>
                            <span>{daysUntilTarget > 0 ? `${daysUntilTarget} days` : "Overdue"}</span>
                          </div>
                        )}
                      </div>
                      {isCompleted && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <Target className="h-4 w-4" />
                          <span>Goal Achieved!</span>
                        </div>
                      )}
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
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-400 mb-4">No financial goals found</p>
            <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      <AddGoalDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSubmit={handleAddGoal} />
    </motion.div>
  )
}
