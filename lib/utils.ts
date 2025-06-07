import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string, format: "short" | "medium" | "long" | "full" = "short"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  const options: Intl.DateTimeFormatOptions = {
    short: { month: "short", day: "numeric" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
    full: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  }[format]

  return new Intl.DateTimeFormat("en-IN", options).format(dateObj)
}

export function calculateHoldingPeriod(purchaseDate: Date): { days: number; isLongTerm: boolean } {
  const today = new Date()
  const days = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
  const isLongTerm = days > 365

  return { days, isLongTerm }
}

export function calculateSIPReturns(executions: any[]) {
  const totalInvested = executions.reduce((sum, exec) => sum + exec.amount, 0)
  const totalUnits = executions.reduce((sum, exec) => sum + exec.units, 0)

  return {
    totalInvested,
    totalUnits,
    averageNAV: totalInvested / totalUnits,
  }
}
