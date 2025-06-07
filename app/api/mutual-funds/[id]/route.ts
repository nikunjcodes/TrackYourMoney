import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { MutualFund } from "@/lib/models"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()

    await connectToDatabase()
    const updatedFund = await MutualFund.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )

    if (!updatedFund) {
      return NextResponse.json(
        { error: "Mutual fund not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedFund)
  } catch (error) {
    console.error("Error updating mutual fund:", error)
    return NextResponse.json(
      { error: "Failed to update mutual fund" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await connectToDatabase()
    const deletedFund = await MutualFund.findByIdAndDelete(id)

    if (!deletedFund) {
      return NextResponse.json(
        { error: "Mutual fund not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Mutual fund deleted successfully" })
  } catch (error) {
    console.error("Error deleting mutual fund:", error)
    return NextResponse.json(
      { error: "Failed to delete mutual fund" },
      { status: 500 }
    )
  }
} 