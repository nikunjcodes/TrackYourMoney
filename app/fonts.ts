import { Inter, Space_Grotesk } from "next/font/google"

// Modern sans-serif font for body text
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

// Modern display font for headings
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

// Export a combined font configuration
export const fonts = {
  sans: inter.style.fontFamily,
  display: spaceGrotesk.style.fontFamily,
} 