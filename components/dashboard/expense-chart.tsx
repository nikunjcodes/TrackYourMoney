"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ExpenseChartProps {
  expenses: any[]
}

export default function ExpenseChart({ expenses }: ExpenseChartProps) {
  // Process expenses data for chart
  const processExpenseData = () => {
    const monthlyData = new Map()

    expenses.forEach((expense) => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthLabel = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { month: monthLabel, amount: 0 })
      }

      monthlyData.get(monthKey).amount += expense.amount
    })

    return Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month))
  }

  const chartData = processExpenseData()

  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        <p>No expense data available</p>
      </div>
    )
  }

  return (
    <ChartContainer
      config={{
        amount: {
          label: "Expenses",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Expenses"]}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="var(--color-amount)"
            strokeWidth={2}
            dot={{ fill: "var(--color-amount)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "var(--color-amount)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
