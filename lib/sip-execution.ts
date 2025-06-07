import { connectToDatabase } from "./mongodb"
import { SIP, SIPExecution, MutualFund } from "./models"
import { getMutualFundPrice } from "./mutual-funds"

interface SIPDocument {
  _id: string
  userId: string
  tradingsymbol: string
  schemeName: string
  amount: number
  frequency: "monthly" | "quarterly"
  nextExecutionDate: Date
  active: boolean
}

export async function executePendingSIPs() {
  console.log("executePendingSIPs - Starting")
  try {
    console.log("Connecting to database...")
    await connectToDatabase()
    console.log("Database connected successfully")

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    console.log("Checking for SIPs due on:", today.toISOString())

    // DEBUG: Print all SIPs and their nextExecutionDate and active status
    const allSIPs = await SIP.find({})
    console.log("All SIPs in DB:")
    allSIPs.forEach((sip: any) => {
      console.log({
        _id: sip._id,
        schemeName: sip.schemeName,
        active: sip.active,
        nextExecutionDate: sip.nextExecutionDate,
        nextExecutionDateType: typeof sip.nextExecutionDate,
        nextExecutionDateISO: sip.nextExecutionDate instanceof Date ? sip.nextExecutionDate.toISOString() : String(sip.nextExecutionDate),
      })
    })
    console.log("Querying for SIPs with:", {
      active: true,
      nextExecutionDate: { $lte: today },
      todayISO: today.toISOString(),
      todayType: typeof today
    })

    // Find all SIPs that are due for execution
    const dueSIPs = await SIP.find({
      active: true,
      nextExecutionDate: { $lte: today },
    }) as SIPDocument[]

    console.log(`Found ${dueSIPs.length} SIPs due for execution`)
    if (dueSIPs.length > 0) {
      console.log("Due SIPs:", dueSIPs.map(sip => ({
        id: sip._id,
        scheme: sip.schemeName,
        amount: sip.amount,
        frequency: sip.frequency,
        nextDate: sip.nextExecutionDate
      })))
    }

    const results = {
      success: true,
      executed: 0,
      failed: 0,
      details: [] as any[]
    }

    for (const sip of dueSIPs) {
      try {
        console.log(`Executing SIP ${sip._id} for ${sip.schemeName}`)
        const execution = await executeSIP(sip)
        results.executed++
        results.details.push({
          id: sip._id,
          scheme: sip.schemeName,
          status: "success",
          execution
        })
      } catch (error) {
        console.error(`Error executing SIP ${sip._id}:`, {
          error,
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined
        })
        results.failed++
        results.details.push({
          id: sip._id,
          scheme: sip.schemeName,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }

    console.log("SIP execution summary:", results)
    return results
  } catch (error) {
    console.error("Error in executePendingSIPs:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}

export async function executeSIP(sip: SIPDocument) {
  console.log(`executeSIP - Starting for ${sip.schemeName}`)
  try {
    // Get current NAV for the mutual fund
    console.log(`Fetching NAV for ${sip.tradingsymbol}`)
    const priceData = await getMutualFundPrice(sip.tradingsymbol)

    if (!priceData) {
      throw new Error(`Price data not found for ${sip.tradingsymbol}`)
    }

    const nav = priceData.last_price
    const units = sip.amount / nav
    console.log(`Calculated units: ${units.toFixed(4)} at NAV ₹${nav}`)

    // Create SIP execution record
    console.log("Creating SIP execution record")
    const sipExecution = await SIPExecution.create({
      userId: sip.userId,
      sipId: sip._id,
      executionDate: new Date(),
      amount: sip.amount,
      nav,
      units,
      status: "executed",
    })
    console.log("SIP execution record created:", sipExecution._id)

    // Check if user already has holdings for this mutual fund
    console.log("Checking for existing holdings")
    const existingHolding = await MutualFund.findOne({
      userId: sip.userId,
      tradingsymbol: sip.tradingsymbol,
    })

    if (existingHolding) {
      console.log("Updating existing holding")
      // Update existing holding - calculate average price
      const totalInvestment = existingHolding.quantity * existingHolding.buyingPrice + sip.amount
      const totalUnits = existingHolding.quantity + units
      const averagePrice = totalInvestment / totalUnits

      await MutualFund.findByIdAndUpdate(existingHolding._id, {
        quantity: totalUnits,
        buyingPrice: averagePrice,
      })
      console.log("Existing holding updated:", {
        totalUnits: totalUnits.toFixed(4),
        averagePrice: averagePrice.toFixed(4)
      })

      // Update SIP execution with holding reference
      await SIPExecution.findByIdAndUpdate(sipExecution._id, {
        mutualFundHoldingId: existingHolding._id,
      })
    } else {
      console.log("Creating new holding")
      // Create new holding
      const newHolding = await MutualFund.create({
        userId: sip.userId,
        tradingsymbol: sip.tradingsymbol,
        amc: priceData.amc,
        schemeName: sip.schemeName,
        schemeType: priceData.scheme_type,
        plan: priceData.plan,
        quantity: units,
        buyingPrice: nav,
        purchaseDate: new Date(),
        brokerName: "SIP Auto-execution",
      })
      console.log("New holding created:", newHolding._id)

      // Update SIP execution with holding reference
      await SIPExecution.findByIdAndUpdate(sipExecution._id, {
        mutualFundHoldingId: newHolding._id,
      })
    }

    // Calculate next execution date
    console.log("Calculating next execution date")
    const nextExecutionDate = new Date(sip.nextExecutionDate)
    if (sip.frequency === "monthly") {
      nextExecutionDate.setMonth(nextExecutionDate.getMonth() + 1)
    } else if (sip.frequency === "quarterly") {
      nextExecutionDate.setMonth(nextExecutionDate.getMonth() + 3)
    }
    console.log("Next execution date:", nextExecutionDate.toISOString())

    // Update SIP with next execution date
    await SIP.findByIdAndUpdate(sip._id, {
      nextExecutionDate,
    })
    console.log("SIP updated with next execution date")

    console.log(`SIP executed successfully: ${sip.schemeName} - ${units.toFixed(4)} units at ₹${nav}`)
    return sipExecution
  } catch (error) {
    console.error(`Error executing SIP ${sip._id}:`, {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })

    // Create failed execution record
    console.log("Creating failed execution record")
    await SIPExecution.create({
      userId: sip.userId,
      sipId: sip._id,
      executionDate: new Date(),
      amount: sip.amount,
      nav: 0,
      units: 0,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error"
    })

    throw error
  }
}

export async function getSIPExecutions(userId: string, sipId?: string) {
  console.log("getSIPExecutions - Starting", { userId, sipId })
  try {
    console.log("Connecting to database...")
    await connectToDatabase()
    console.log("Database connected successfully")

    const query: any = { userId }
    if (sipId) {
      query.sipId = sipId
    }
    console.log("Query:", query)

    const executions = await SIPExecution.find(query)
      .populate("sipId")
      .sort({ executionDate: -1 })
    
    console.log(`Found ${executions.length} executions`)
    return executions
  } catch (error) {
    console.error("Error fetching SIP executions:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    return []
  }
}
