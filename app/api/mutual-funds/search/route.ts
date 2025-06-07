import { NextRequest, NextResponse } from "next/server"
import { getAllMutualFundPrices } from "@/lib/mutual-funds"
import type { MutualFundPrice } from "@/lib/mutual-funds"

export async function GET(request: NextRequest): Promise<NextResponse<MutualFundPrice[] | { error: string }>> {
  console.log("GET /api/mutual-funds/search - Starting request")
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")?.toLowerCase() || ""
  const limit = parseInt(searchParams.get("limit") || "20")
  console.log("Search params:", { query, limit })

  try {
    console.log("Fetching all mutual fund prices...")
    const funds = await getAllMutualFundPrices()
    console.log("Found total funds:", funds.length)
    
    // Filter funds based on search query
    console.log("Filtering funds based on query...")
    const filteredFunds = query
      ? funds.filter(
          (fund) =>
            fund.name.toLowerCase().includes(query) ||
            fund.amc.toLowerCase().includes(query) ||
            fund.tradingsymbol.toLowerCase().includes(query)
        )
      : funds
    console.log("Filtered funds count:", filteredFunds.length)

    // Apply limit
    const limitedFunds = filteredFunds.slice(0, limit)
    console.log("Returning limited funds:", limitedFunds.length)
    
    return NextResponse.json(limitedFunds)
  } catch (error) {
    console.error("Detailed error in search API:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ error: "Failed to search mutual funds" }, { status: 500 })
  }
}
