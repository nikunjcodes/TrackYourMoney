import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { SIP } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const sips = await SIP.find({ userId: session.id }).sort({ nextExecutionDate: 1 })

    return NextResponse.json(sips)
  } catch (error) {
    console.error("Error fetching SIPs:", error)
    return NextResponse.json({ error: "Failed to fetch SIPs" }, { status: 500 })
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

    // Calculate next execution date based on start date and frequency
    const startDate = new Date(body.startDate)
    const nextExecutionDate = new Date(startDate)

    if (body.frequency === "monthly") {
      nextExecutionDate.setMonth(nextExecutionDate.getMonth() + 1)
    } else if (body.frequency === "quarterly") {
      nextExecutionDate.setMonth(nextExecutionDate.getMonth() + 3)
    }

    const sip = await SIP.create({
      ...body,
      userId: session.id,
      startDate,
      nextExecutionDate,
    })

    return NextResponse.json(sip)
  } catch (error) {
    console.error("Error creating SIP:", error)
    return NextResponse.json({ error: "Failed to create SIP" }, { status: 500 })
  }
}
