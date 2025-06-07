"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data - in a real app, this would come from the database
const generateSampleData = () => {
  const now = new Date()
  const data = []

  // Generate data for the last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)

    // Base value that increases over time with some randomness
    const baseValue = 100000 + (11 - i) * 5000
    const randomFactor = 0.9 + Math.random() * 0.2 // Random factor between 0.9 and 1.1

    data.push({
      month: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      value: Math.round(baseValue * randomFactor),
    })
  }

  return data
}

const portfolioData = generateSampleData()

export default function PortfolioChart() {
  return (
    <ChartContainer
      config={{
        value: {
          label: "Portfolio Value",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={portfolioData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Portfolio Value"]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={{ fill: "var(--color-value)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "var(--color-value)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
