"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ArrowRight, Shield, Target, Wallet, TrendingUp, PieChart, Calendar, DollarSign, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Dynamically import the particle background to avoid SSR issues
const DynamicParticleBackground = dynamic(() => import("@/components/enhanced-particle-background"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black" />,
})

// Custom cursor component
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    window.addEventListener("mousemove", updatePosition)
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter)
      el.addEventListener("mouseleave", handleMouseLeave)
    })

    return () => {
      window.removeEventListener("mousemove", updatePosition)
      document.querySelectorAll("a, button").forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter)
        el.removeEventListener("mouseleave", handleMouseLeave)
      })
    }
  }, [])

  return (
    <motion.div
      className="fixed pointer-events-none z-50 mix-blend-difference"
      animate={{
        x: position.x - 16,
        y: position.y - 16,
        scale: isHovering ? 1.5 : 1,
      }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      <div className="w-8 h-8 rounded-full bg-white" />
    </motion.div>
  )
}

// Floating gradient orbs
const GradientOrbs = () => {
  return (
    <>
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-800/10 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  )
}

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  const features = [
    {
      icon: <PieChart className="h-8 w-8" />,
      title: "Smart Portfolio Tracking",
      description: "Track your mutual funds with real-time NAV updates and tax-optimized holding period calculations.",
      color: "blue",
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Automated SIP Management",
      description: "Set up systematic investment plans with automatic execution and portfolio rebalancing.",
      color: "blue",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Insurance Hub",
      description: "Manage all your family's insurance policies with premium reminders and coverage tracking.",
      color: "blue",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Goal-Based Planning",
      description: "Set financial goals for education, retirement, and life milestones with progress tracking.",
      color: "blue",
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Expense Analytics",
      description: "Categorize and analyze your spending patterns with intelligent insights and budgeting tools.",
      color: "blue",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Performance Analytics",
      description: "Comprehensive portfolio analysis with returns calculation and benchmark comparisons.",
      color: "blue",
    },
  ]

  const stats = [
    { value: "₹10L+", label: "Assets Tracked", icon: <Wallet className="h-6 w-6" /> },
    { value: "500+", label: "Happy Families", icon: <Sparkles className="h-6 w-6" /> },
    { value: "99.9%", label: "Uptime", icon: <Shield className="h-6 w-6" /> },
    { value: "24/7", label: "Support", icon: <Target className="h-6 w-6" /> },
  ]

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <CustomCursor />
      <DynamicParticleBackground />
      <GradientOrbs />

      <div className="container relative mx-auto px-4 py-8">
        {/* Navigation */}
        <motion.nav
          className="flex items-center justify-between py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              className="rounded-xl bg-blue-600/20 p-2 backdrop-blur-sm"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Wallet className="h-8 w-8 text-blue-400" />
            </motion.div>
            <span className="font-display text-2xl font-bold text-blue-400">
              TrackYourMoney
            </span>
          </motion.div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-blue-400 transition-colors relative group"
            >
              Login
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                className="relative overflow-hidden border-blue-500/50 text-blue-400 hover:text-white transition-all duration-300 group"
              >
                <span className="relative z-10">Get Started</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </Button>
            </Link>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <motion.div
          className="mt-20 flex flex-col items-center justify-center text-center"
          style={{ opacity, scale }}
        >
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-600/10 px-4 py-2 text-sm backdrop-blur-sm">
              <motion.div
                className="h-2 w-2 rounded-full bg-blue-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-blue-300 font-medium">
                Advanced Family Finance Management
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="font-display max-w-4xl text-5xl font-bold leading-tight md:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your Family's
            <br />
            <span className="relative mt-19">
              <span className="text-blue-400" >
                Financial Future
              </span>
              <motion.div
                className="absolute -bottom--1 left-0 w-full h-1 bg-blue-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1 }}
              />
            </span>
            <br />
            Starts Here
          </motion.h1>

          <motion.p
            className="mt-8 max-w-2xl text-xl text-gray-300 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Comprehensive portfolio tracking, automated SIP management, insurance oversight, and goal-based financial
            planning. All in one intelligent platform designed for modern families.
          </motion.p>

          <motion.div
            className="mt-12 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/register">
              <Button
                className="group relative overflow-hidden bg-blue-600 px-8 py-6 text-lg hover:bg-blue-700 transition-all duration-300"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Your Journey
                  <motion.div
                    animate={{ x: isHovered ? 5 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </span>
              </Button>
            </Link>
            <Button
              variant="outline"
              className="group relative overflow-hidden border-blue-500 px-8 py-6 text-lg hover:bg-blue-600/10 transition-all duration-300"
            >
              <span className="relative z-10">Watch Demo</span>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="group relative rounded-2xl border border-blue-500/20 bg-black/50 p-6 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="mb-2 text-blue-400">{stat.icon}</div>
                  <div className="font-display text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="mt-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="text-center mb-16">
            <motion.h2
              className="font-display text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Everything You Need for
              <span className="text-blue-400">
                {" "}
                Smart Finance Management
              </span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-400 max-w-2xl mx-auto font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Powerful tools and insights to help your family achieve financial success
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative rounded-2xl border border-blue-500/20 bg-black/50 p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="mb-6 rounded-xl bg-blue-600/20 p-3 w-fit group-hover:scale-110 transition-transform duration-300">
                  <div className="text-blue-400">{feature.icon}</div>
                </div>
                <h3 className="font-display mb-3 text-xl font-bold group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed font-light">{feature.description}</p>
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-32 mb-16 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <div className="relative rounded-3xl border border-blue-500/20 bg-black/50 p-12 backdrop-blur-sm overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-blue-600/5"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative z-10">
              <h2 className="font-display text-4xl font-bold mb-6">
                Ready to Transform Your
                <span className="text-blue-400">
                  {" "}
                  Financial Journey?
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto font-light">
                Join thousands of families who have taken control of their finances with TrackYourMoney
              </p>
              <Link href="/register">
                <Button
                  className="group relative overflow-hidden bg-blue-600 px-8 py-6 text-lg hover:bg-blue-700 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Today
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
