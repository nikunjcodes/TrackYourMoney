import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { FinancialGoal } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const goals = await FinancialGoal.find({ userId: session.id }).sort({ targetDate: 1 })

    return NextResponse.json(goals)
  } catch (error) {
    console.error("Error fetching financial goals:", error)
    return NextResponse.json({ error: "Failed to fetch financial goals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    await connectToDatabase()

    const goal = await FinancialGoal.create({
      ...body,
      userId: session.id,
      targetDate: new Date(body.targetDate),
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Error creating financial goal:", error)
    return NextResponse.json({ error: "Failed to create financial goal" }, { status: 500 })
  }
}
