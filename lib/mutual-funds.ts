import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

// Define and export the mutual fund price interface
export interface MutualFundPrice {
  _id: string
  tradingsymbol: string
  amc: string
  name: string
  minimum_purchase_amount: number
  scheme_type: string
  plan: string
  last_price: number
  last_price_date: Date
}

export async function getAllMutualFundPrices(): Promise<MutualFundPrice[]> {
  console.log("getAllMutualFundPrices - Starting")
  try {
    console.log("Connecting to database...")
    const mongoose = await connectToDatabase()
    console.log("Database connected successfully")

    if (!mongoose.connection.db) {
      throw new Error("Database connection not established")
    }

    const db = mongoose.connection.db
    const collection = db.collection('mutualfunds_prices')
    console.log("Fetching all mutual fund prices from database...")
    
    const prices = await collection.find({}).toArray()
    console.log(`Found ${prices.length} mutual fund prices`)

    // Transform the MongoDB documents to our interface type
    const transformedPrices = prices.map(price => ({
      _id: price._id.toString(),
      tradingsymbol: price.tradingsymbol,
      amc: price.amc,
      name: price.name,
      minimum_purchase_amount: price.minimum_purchase_amount,
      scheme_type: price.scheme_type,
      plan: price.plan,
      last_price: price.last_price,
      last_price_date: price.last_price_date,
    })) as MutualFundPrice[]

    return transformedPrices
  } catch (error) {
    console.error("Detailed error in getAllMutualFundPrices:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    return []
  }
}

export async function getMutualFundPrice(tradingsymbol: string): Promise<MutualFundPrice | null> {
  console.log("getMutualFundPrice - Starting for symbol:", tradingsymbol)
  try {
    console.log("Connecting to database...")
    const mongoose = await connectToDatabase()
    console.log("Database connected successfully")

    if (!mongoose.connection.db) {
      console.error("Database connection not established")
      throw new Error("Database connection not established")
    }

    const db = mongoose.connection.db
    const collection = db.collection('mutualfunds_prices')
    console.log("Querying database for price...")
    const price = await collection.findOne({ tradingsymbol })
    console.log("Price found:", price ? "Yes" : "No")
    
    if (!price) return null
    
    // Cast the MongoDB document to our MutualFundPrice type
    const result = {
      _id: price._id.toString(),
      tradingsymbol: price.tradingsymbol,
      amc: price.amc,
      name: price.name,
      minimum_purchase_amount: price.minimum_purchase_amount,
      scheme_type: price.scheme_type,
      plan: price.plan,
      last_price: price.last_price,
      last_price_date: price.last_price_date,
    } as MutualFundPrice
    console.log("Returning price data")
    return result

  } catch (error) {
    console.error("Detailed error in getMutualFundPrice:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    return null
  }
}

export async function calculateMutualFundValues(mutualFunds: any[]) {
  console.log("calculateMutualFundValues - Starting")
  try {
    const fundsWithValues = await Promise.all(
      mutualFunds.map(async (fund) => {
        console.log(`Calculating values for fund: ${fund.tradingsymbol}`)
        const priceData = await getMutualFundPrice(fund.tradingsymbol)
        const currentPrice = priceData?.last_price || fund.buyingPrice
        const currentValue = fund.quantity * currentPrice

        return {
          ...fund.toObject(),
          lastPrice: currentPrice,
          lastPriceDate: priceData?.last_price_date || fund.purchaseDate,
          currentValue,
        }
      }),
    )
    console.log("Calculation complete")
    return fundsWithValues
  } catch (error) {
    console.error("Error calculating mutual fund values:", error)
    return mutualFunds
  }
}
