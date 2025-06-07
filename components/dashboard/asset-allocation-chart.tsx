"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface AssetAllocationChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
}

export default function AssetAllocationChart({ data }: AssetAllocationChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-gray-800 bg-black p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-400">{formatCurrency(data.value)}</p>
          <p className="text-xs text-gray-400">{((data.value / data.total) * 100).toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  // Calculate total for percentage calculation
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const dataWithTotal = data.map((item) => ({ ...item, total }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={dataWithTotal} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
          {dataWithTotal.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
