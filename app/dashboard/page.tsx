import { getSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { MutualFund, SIP, Insurance, Expense, FinancialGoal } from "@/lib/models"
import DashboardOverview from "@/components/dashboard/overview"
import { calculateMutualFundValues } from "@/lib/mutual-funds"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    return null
  }

  await connectToDatabase()

  // Fetch user's data
  const [mutualFunds, sips, insurances, expenses, goals] = await Promise.all([
    MutualFund.find({ userId: session.id }),
    SIP.find({ userId: session.id }),
    Insurance.find({ userId: session.id }),
    Expense.find({ userId: session.id }).sort({ date: -1 }).limit(5),
    FinancialGoal.find({ userId: session.id }),
  ])

  // Calculate mutual fund values with latest prices
  const mutualFundsWithValues = await calculateMutualFundValues(mutualFunds)

  // Calculate total portfolio value
  const totalPortfolioValue = mutualFundsWithValues.reduce((total, fund) => total + (fund.currentValue || 0), 0)

  // Calculate total expenses for current month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyExpenses = await Expense.aggregate([
    {
      $match: {
        userId: session.id,
        date: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1),
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ])

  const totalMonthlyExpenses = monthlyExpenses.length > 0 ? monthlyExpenses[0].total : 0

  // Calculate upcoming insurance premiums
  const upcomingPremiums = insurances
    .filter((insurance) => {
      const dueDate = new Date(insurance.nextDueDate)
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      return dueDate >= today && dueDate <= thirtyDaysFromNow
    })
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())

  // Calculate upcoming SIPs
  const upcomingSIPs = sips
    .filter((sip) => {
      const executionDate = new Date(sip.nextExecutionDate)
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      return executionDate >= today && executionDate <= thirtyDaysFromNow
    })
    .sort((a, b) => new Date(a.nextExecutionDate).getTime() - new Date(b.nextExecutionDate).getTime())

  return (
    <DashboardOverview
      user={session}
      mutualFunds={mutualFundsWithValues}
      sips={upcomingSIPs}
      insurances={upcomingPremiums}
      expenses={expenses}
      goals={goals}
      totalPortfolioValue={totalPortfolioValue}
      totalMonthlyExpenses={totalMonthlyExpenses}
    />
  )
}
