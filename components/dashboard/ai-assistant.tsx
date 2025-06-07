"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, Loader2, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Message {
  role: "user" | "assistant"
  content: string | AIResponse | React.ReactNode
}

interface AIResponse {
  header: string
  summary: string
  sections: {
    title: string
    content: string
    bullets: string[]
  }[]
  fundAnalysis: {
    schemeName: string
    analysis: string
    recommendations: string[]
    metrics: {
      performance: string
      risk: string
      rating: string
    }
  }[]
  recommendations: {
    shortTerm: string[]
    longTerm: string[]
  }
}

interface AIAssistantProps {
  mutualFunds: any[]
  portfolioStats: {
    totalInvestment: number
    totalCurrentValue: number
    totalProfitLoss: number
    profitLossPercentage: string
  }
}

export default function AIAssistant({ mutualFunds, portfolioStats }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const generatePrompt = (query: string) => {
    const portfolioSummary = `
Portfolio Summary:
- Total Investment: ₹${portfolioStats.totalInvestment.toLocaleString()}
- Current Value: ₹${portfolioStats.totalCurrentValue.toLocaleString()}
- Total P&L: ₹${portfolioStats.totalProfitLoss.toLocaleString()} (${portfolioStats.profitLossPercentage}%)

Holdings:
${mutualFunds.map(fund => `
- ${fund.schemeName} (${fund.schemeType})
  * Units: ${fund.quantity}
  * Avg Price: ₹${fund.buyingPrice}
  * Current NAV: ₹${fund.lastPrice || fund.buyingPrice}
  * Investment: ₹${(fund.buyingPrice * fund.quantity).toLocaleString()}
  * Current Value: ₹${fund.currentValue?.toLocaleString() || (fund.buyingPrice * fund.quantity).toLocaleString()}
  * P&L: ${((fund.currentValue || fund.buyingPrice * fund.quantity) - (fund.buyingPrice * fund.quantity)).toLocaleString()}
`).join("\n")}
`

    return `As a financial advisor AI, analyze this mutual fund portfolio and answer the following question:
${query}

Portfolio Data:
${portfolioSummary}

Please provide a detailed, professional analysis focusing on:
1. Portfolio diversification
2. Risk assessment
3. Performance metrics
4. Specific recommendations
5. Market context where relevant

Format the response in clear, concise points with relevant metrics.`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: generatePrompt(userMessage),
        }),
      })

      if (!response.ok) throw new Error("Failed to get AI response")

      const data = await response.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Error getting AI response:", error)
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: {
            header: "Error",
            summary: "I apologize, but I'm having trouble analyzing your portfolio right now. Please try again later.",
            sections: [],
            fundAnalysis: [],
            recommendations: { shortTerm: [], longTerm: [] }
          }
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const renderAIResponse = (content: AIResponse) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-blue-400">{content.header}</h3>
        <p className="text-gray-300">{content.summary}</p>
      </div>

      {content.sections.map((section, index) => (
        <div key={index} className="space-y-2">
          <button
            onClick={() => toggleSection(`section-${index}`)}
            className="flex w-full items-center justify-between rounded-lg bg-blue-600/10 p-3 text-left hover:bg-blue-600/20"
          >
            <h4 className="font-medium text-blue-400">{section.title}</h4>
            {expandedSections.has(`section-${index}`) ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.has(`section-${index}`) && (
            <div className="space-y-2 rounded-lg bg-blue-600/5 p-4">
              <p className="text-gray-300">{section.content}</p>
              {section.bullets.length > 0 && (
                <ul className="list-inside list-disc space-y-1 text-gray-300">
                  {section.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}

      {content.fundAnalysis.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-blue-400">Fund Analysis</h4>
          {content.fundAnalysis.map((fund, index) => (
            <div key={index} className="rounded-lg border border-blue-500/20 bg-blue-600/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h5 className="font-medium text-blue-400">{fund.schemeName}</h5>
                <Badge variant="outline" className="bg-blue-600/10">
                  Rating: {fund.metrics.rating}/5
                </Badge>
              </div>
              <p className="mb-2 text-gray-300">{fund.analysis}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Performance</p>
                  <p className="text-gray-300">{fund.metrics.performance}</p>
                </div>
                <div>
                  <p className="text-gray-400">Risk Level</p>
                  <p className="text-gray-300">{fund.metrics.risk}</p>
                </div>
              </div>
              {fund.recommendations.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-400">Recommendations:</p>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-gray-300">
                    {fund.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(content.recommendations.shortTerm.length > 0 || content.recommendations.longTerm.length > 0) && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-blue-400">Recommendations</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {content.recommendations.shortTerm.length > 0 && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-600/5 p-4">
                <h5 className="mb-2 font-medium text-blue-400">Short Term</h5>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-300">
                  {content.recommendations.shortTerm.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            {content.recommendations.longTerm.length > 0 && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-600/5 p-4">
                <h5 className="mb-2 font-medium text-blue-400">Long Term</h5>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-300">
                  {content.recommendations.longTerm.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true)
          setMessages([]) // Clear messages when opening
          setExpandedSections(new Set()) // Reset expanded sections
        }}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-blue-600 p-0 hover:bg-blue-700"
      >
        <Bot className="h-8 w-8" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative mx-4 h-[90vh] w-[800px] max-w-[90vw]"
            >
              <Card className="h-full border-blue-500/20 bg-black/50 backdrop-blur-sm">
                <CardContent className="flex h-full flex-col p-0">
                  <div className="flex items-center justify-between border-b border-blue-500/20 p-4">
                    <div className="flex items-center gap-2">
                      <Bot className="h-7 w-7 text-blue-400" />
                      <h3 className="text-xl font-semibold">AI Portfolio Assistant</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => {
                        setIsOpen(false)
                        setMessages([]) // Clear messages when closing
                        setExpandedSections(new Set()) // Reset expanded sections
                      }}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                      {messages.length === 0 ? (
                        <div className="text-center">
                          <p className="text-lg text-gray-300">Ask me anything about your portfolio!</p>
                          <p className="mt-6 text-gray-400">For example:</p>
                          <ul className="mt-4 space-y-3 text-left">
                            <li className="rounded-lg border border-blue-500/20 bg-blue-600/5 p-4 text-base hover:bg-blue-600/10 transition-colors">
                              • How is my portfolio diversified?
                            </li>
                            <li className="rounded-lg border border-blue-500/20 bg-blue-600/5 p-4 text-base hover:bg-blue-600/10 transition-colors">
                              • What's the risk profile of my investments?
                            </li>
                            <li className="rounded-lg border border-blue-500/20 bg-blue-600/5 p-4 text-base hover:bg-blue-600/10 transition-colors">
                              • Suggest improvements for better returns
                            </li>
                            <li className="rounded-lg border border-blue-500/20 bg-blue-600/5 p-4 text-base hover:bg-blue-600/10 transition-colors">
                              • Analyze the performance of specific funds
                            </li>
                          </ul>
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[90%] rounded-lg p-5 ${
                                message.role === "user"
                                  ? "bg-blue-600 text-white"
                                  : "bg-blue-600/10"
                              }`}
                            >
                              {message.role === "user" ? (
                                message.content as string
                              ) : typeof message.content === "string" ? (
                                message.content
                              ) : (
                                renderAIResponse(message.content as AIResponse)
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="flex items-center gap-3 rounded-lg bg-blue-600/10 p-5 text-gray-200">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-lg">Analyzing portfolio...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <form onSubmit={handleSubmit} className="border-t border-blue-500/20 p-4">
                    <div className="flex gap-3">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your portfolio..."
                        className="border-blue-500/20 bg-black/50 text-lg h-12"
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 px-8 h-12"
                        disabled={isLoading || !input.trim()}
                      >
                        <Send className="h-6 w-6" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 