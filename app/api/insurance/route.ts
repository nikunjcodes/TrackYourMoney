import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Insurance } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const insurances = await Insurance.find({ userId: session.id }).sort({ nextDueDate: 1 })

    return NextResponse.json(insurances)
  } catch (error) {
    console.error("Error fetching insurance policies:", error)
    return NextResponse.json({ error: "Failed to fetch insurance policies" }, { status: 500 })
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

    const insurance = await Insurance.create({
      ...body,
      userId: session.id,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      nextDueDate: new Date(body.nextDueDate),
    })

    return NextResponse.json(insurance)
  } catch (error) {
    console.error("Error creating insurance policy:", error)
    return NextResponse.json({ error: "Failed to create insurance policy" }, { status: 500 })
  }
}
