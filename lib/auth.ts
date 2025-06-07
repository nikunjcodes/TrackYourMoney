"use server"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { z } from "zod"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/lib/models"
import bcrypt from "bcryptjs"

const secretKey = process.env.JWT_SECRET || "default_secret_key_change_in_production"
const key = new TextEncoder().encode(secretKey)

export async function getSession() {
  const token =  (await cookies()).get("session")?.value
  if (!token) return null

  try {
    const verified = await jwtVerify(token, key)
    return verified.payload as { id: string; email: string; name: string }
  } catch (error) {
    return null
  }
}

export async function login({
  email,
  password,
}: {
  email: string
  password: string
}) {
  await connectToDatabase()

  const user = await User.findOne({ email })
  if (!user) {
    throw new Error("User not found")
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new Error("Invalid password")
  }

  // Create session
  const session = await new SignJWT({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key)

  cookies().set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return { success: true }
}

export async function register({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}) {
  const userSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  })

  const validatedData = userSchema.parse({ name, email, password })

  await connectToDatabase()

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedData.password, 10)

  // Create user
  const user = await User.create({
    name: validatedData.name,
    email: validatedData.email,
    password: hashedPassword,
  })

  // Create session
  const session = await new SignJWT({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key)

  cookies().set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return { success: true }
}

export async function logout() {
  cookies().delete("session")
  return { success: true }
}
