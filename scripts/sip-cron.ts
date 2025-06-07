import { executePendingSIPs } from "../lib/sip-execution"

async function runSIPExecution() {
  console.log("=== Starting SIP Execution Job ===")
  console.log("Current time:", new Date().toISOString())
  
  try {
    console.log("Calling executePendingSIPs...")
    const result = await executePendingSIPs()
    
    console.log("=== SIP Execution Summary ===")
    console.log("Total SIPs processed:", result.executed + result.failed)
    console.log("Successfully executed:", result.executed)
    console.log("Failed executions:", result.failed)
    
    if (result.details.length > 0) {
      console.log("\nExecution Details:")
      result.details.forEach((detail, index) => {
        console.log(`\n${index + 1}. SIP: ${detail.scheme}`)
        console.log(`   Status: ${detail.status}`)
        if (detail.status === "failed") {
          console.log(`   Error: ${detail.error}`)
        }
        if (detail.execution) {
          console.log(`   Execution ID: ${detail.execution._id}`)
          console.log(`   Units: ${detail.execution.units}`)
          console.log(`   NAV: ₹${detail.execution.nav}`)
        }
      })
    }
    
    console.log("\n=== SIP Execution Job Completed ===")
  } catch (error) {
    console.error("\n=== SIP Execution Job Failed ===")
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error
    })
    process.exit(1) // Exit with error code
  }
}

// Run the job
console.log("Starting SIP cron job...")
runSIPExecution()
  .then(() => {
    console.log("SIP cron job finished")
    process.exit(0) // Exit successfully
  })
  .catch((error) => {
    console.error("SIP cron job failed:", error)
    process.exit(1) // Exit with error code
  }) 