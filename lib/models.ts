import mongoose from "mongoose"

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Mutual Fund Schema
const MutualFundSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tradingsymbol: {
    type: String,
    required: true,
  },
  amc: {
    type: String,
    required: true,
  },
  schemeName: {
    type: String,
    required: true,
  },
  schemeType: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  buyingPrice: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  brokerName: {
    type: String,
    default: "",
  },
})

// SIP Schema
const SIPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mutualFundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MutualFund",
  },
  schemeName: {
    type: String,
    required: true,
  },
  tradingsymbol: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  frequency: {
    type: String,
    enum: ["monthly", "quarterly"],
    default: "monthly",
  },
  startDate: {
    type: Date,
    required: true,
  },
  nextExecutionDate: {
    type: Date,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
})

// SIP Execution Schema
const SIPExecutionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SIP",
    required: true,
  },
  executionDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  nav: {
    type: Number,
    required: true,
  },
  units: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "executed", "failed"],
    default: "pending",
  },
  mutualFundHoldingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MutualFund",
  },
})

// Insurance Schema
const InsuranceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["health", "life", "vehicle", "home", "other"],
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  policyNumber: {
    type: String,
    required: true,
  },
  sumAssured: {
    type: Number,
    required: true,
  },
  premium: {
    type: Number,
    required: true,
  },
  premiumFrequency: {
    type: String,
    enum: ["monthly", "quarterly", "half-yearly", "yearly"],
    default: "yearly",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  nextDueDate: {
    type: Date,
    required: true,
  },
})

// Expense Schema
const ExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    default: "",
  },
  paymentMethod: {
    type: String,
    default: "cash",
  },
})

// Financial Goal Schema
const FinancialGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  targetAmount: {
    type: Number,
    required: true,
  },
  currentAmount: {
    type: Number,
    default: 0,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    enum: ["education", "retirement", "home", "vehicle", "travel", "other"],
    default: "other",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
})

// Portfolio History Schema
const PortfolioHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  totalValue: {
    type: Number,
    required: true,
  },
  mutualFundsValue: {
    type: Number,
    default: 0,
  },
  stocksValue: {
    type: Number,
    default: 0,
  },
  cashValue: {
    type: Number,
    default: 0,
  },
  otherAssetsValue: {
    type: Number,
    default: 0,
  },
})

// Define models
export const User = mongoose.models.User || mongoose.model("User", UserSchema)
export const MutualFund = mongoose.models.MutualFund || mongoose.model("MutualFund", MutualFundSchema)
export const SIP = mongoose.models.SIP || mongoose.model("SIP", SIPSchema)
export const Insurance = mongoose.models.Insurance || mongoose.model("Insurance", InsuranceSchema)
export const Expense = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema)
export const FinancialGoal = mongoose.models.FinancialGoal || mongoose.model("FinancialGoal", FinancialGoalSchema)
export const PortfolioHistory =
  mongoose.models.PortfolioHistory || mongoose.model("PortfolioHistory", PortfolioHistorySchema)
export const SIPExecution = mongoose.models.SIPExecution || mongoose.model("SIPExecution", SIPExecutionSchema)
