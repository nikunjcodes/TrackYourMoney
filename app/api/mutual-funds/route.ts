import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { MutualFund } from "@/lib/models"
import { calculateMutualFundValues, getAllMutualFundPrices } from "@/lib/mutual-funds"
import type { MutualFundPrice } from "@/lib/mutual-funds"

export async function GET(request: NextRequest): Promise<NextResponse<MutualFundPrice[] | { error: string }>> {
  console.log("GET /api/mutual-funds - Starting request")
  try {
    const session = await getSession()
    console.log("Session status:", session ? "Found" : "Not found")

    // Check if this is a request for available funds (no auth required)
    const searchParams = request.nextUrl.searchParams
    const availableOnly = searchParams.get("available") === "true"

    if (availableOnly) {
      console.log("Fetching available mutual funds")
      const funds = await getAllMutualFundPrices()
      return NextResponse.json(funds)
    }

    // For user holdings, require authentication
    if (!session) {
      console.log("Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Connecting to database...")
    await connectToDatabase()
    console.log("Database connected successfully")

    console.log("Fetching mutual funds for user:", session.id)
    const mutualFunds = await MutualFund.find({ userId: session.id })
    console.log("Found mutual funds:", mutualFunds.length)

    console.log("Calculating mutual fund values...")
    const mutualFundsWithValues = await calculateMutualFundValues(mutualFunds)
    console.log("Calculation complete")

    return NextResponse.json(mutualFundsWithValues)
  } catch (error) {
    console.error("Detailed error in GET /api/mutual-funds:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ error: "Failed to fetch mutual funds" }, { status: 500 })
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

    const mutualFund = await MutualFund.create({
      ...body,
      userId: session.id,
      purchaseDate: new Date(body.purchaseDate),
    })

    return NextResponse.json(mutualFund)
  } catch (error) {
    console.error("Error creating mutual fund:", error)
    return NextResponse.json({ error: "Failed to create mutual fund" }, { status: 500 })
  }
}
