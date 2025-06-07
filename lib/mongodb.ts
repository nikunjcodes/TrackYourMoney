import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/trackyourmoney"

// Define the type for our mongoose cache
interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Extend the global type to include our mongoose cache
declare global {
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

export async function connectToDatabase() {
  console.log("connectToDatabase - Starting")
  if (cached.conn) {
    console.log("Using cached database connection")
    return cached.conn
  }

  if (!cached.promise) {
    console.log("Creating new database connection")
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("Database connection established successfully")
      return mongoose
    }).catch((error) => {
      console.error("Database connection failed:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    })
  }

  try {
    console.log("Waiting for database connection...")
    cached.conn = await cached.promise
    console.log("Database connection ready")
    return cached.conn
  } catch (error) {
    console.error("Error in connectToDatabase:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}
