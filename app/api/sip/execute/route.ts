import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { executePendingSIPs } from "@/lib/sip-execution"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await executePendingSIPs()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error executing SIPs:", error)
    return NextResponse.json({ error: "Failed to execute SIPs" }, { status: 500 })
  }
}
