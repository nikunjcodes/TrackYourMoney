import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const JSON_FORMAT = `{
  "header": "Main analysis title",
  "summary": "Brief 2-3 sentence summary",
  "sections": [
    {
      "title": "Section title",
      "content": "Main content for this section",
      "bullets": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "fundAnalysis": [
    {
      "schemeName": "Fund name",
      "analysis": "Specific analysis for this fund",
      "recommendations": ["Recommendation 1", "Recommendation 2"],
      "metrics": {
        "performance": "Performance metric",
        "risk": "Risk assessment",
        "rating": "Rating (1-5)"
      }
    }
  ],
  "recommendations": {
    "shortTerm": ["Short term recommendation 1", "Short term recommendation 2"],
    "longTerm": ["Long term recommendation 1", "Long term recommendation 2"]
  }
}`

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Generate content with structured JSON response
    const result = await model.generateContent(`
${prompt}

IMPORTANT: You must respond with a valid JSON object in the following format. Do not include any markdown formatting, backticks, or additional text outside the JSON structure:

${JSON_FORMAT}

Your response must be a single, valid JSON object that can be parsed by JSON.parse(). Do not include any explanatory text, markdown formatting, or code blocks. The response should start with { and end with }.`)

    const response = await result.response
    const text = response.text()

    // Clean the response text to ensure it's valid JSON
    const cleanedText = text
      .replace(/```json\n?/g, '') // Remove JSON code block markers
      .replace(/```\n?/g, '')     // Remove any remaining code block markers
      .replace(/^[^{]*/, '')      // Remove any text before the first {
      .replace(/[^}]*$/, '')      // Remove any text after the last }
      .trim()                     // Remove any extra whitespace

    // Try to parse the cleaned response as JSON
    try {
      const jsonResponse = JSON.parse(cleanedText)
      return NextResponse.json({ response: jsonResponse })
    } catch (parseError) {
      console.error("Error parsing AI response as JSON:", parseError)
      console.error("Raw response:", text)
      console.error("Cleaned response:", cleanedText)
      
      // Return a structured error response
      return NextResponse.json({ 
        response: {
          header: "Analysis Results",
          summary: "Unable to format response as structured data. Please try again.",
          sections: [{
            title: "Error",
            content: "The AI response could not be properly formatted. This might be due to the complexity of the analysis or formatting issues.",
            bullets: [
              "Please try rephrasing your question",
              "The response may be too complex for the current format",
              "You can try asking for a more specific analysis"
            ]
          }],
          fundAnalysis: [],
          recommendations: {
            shortTerm: ["Try asking a more specific question about your portfolio"],
            longTerm: ["Consider breaking down complex questions into smaller, more focused queries"]
          }
        }
      })
    }
  } catch (error) {
    console.error("Error generating AI response:", error)
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    )
  }
} 