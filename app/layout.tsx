import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { inter, spaceGrotesk } from "./fonts"

export const metadata: Metadata = {
  title: "TrackYourMoney - Advanced Family Finance Management",
  description: "Comprehensive portfolio tracking, automated SIP management, insurance oversight, and goal-based financial planning for modern families.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
