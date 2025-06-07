"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executePendingSIPs = executePendingSIPs;
exports.executeSIP = executeSIP;
exports.getSIPExecutions = getSIPExecutions;
var connectToDatabase = require("./mongodb").connectToDatabase;
var _a = require("./models"), SIP = _a.SIP, SIPExecution = _a.SIPExecution, MutualFund = _a.MutualFund;
var getMutualFundPrice = require("./mutual-funds").getMutualFundPrice;
function executePendingSIPs() {
    return __awaiter(this, void 0, void 0, function () {
        var today, dueSIPs, results, _i, dueSIPs_1, sip, execution, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("executePendingSIPs - Starting");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    console.log("Connecting to database...");
                    return [4 /*yield*/, connectToDatabase()];
                case 2:
                    _a.sent();
                    console.log("Database connected successfully");
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    console.log("Checking for SIPs due on:", today.toISOString());
                    return [4 /*yield*/, SIP.find({
                            active: true,
                            nextExecutionDate: { $lte: today },
                        })];
                case 3:
                    dueSIPs = _a.sent();
                    console.log("Found ".concat(dueSIPs.length, " SIPs due for execution"));
                    if (dueSIPs.length > 0) {
                        console.log("Due SIPs:", dueSIPs.map(function (sip) { return ({
                            id: sip._id,
                            scheme: sip.schemeName,
                            amount: sip.amount,
                            frequency: sip.frequency,
                            nextDate: sip.nextExecutionDate
                        }); }));
                    }
                    results = {
                        success: true,
                        executed: 0,
                        failed: 0,
                        details: []
                    };
                    _i = 0, dueSIPs_1 = dueSIPs;
                    _a.label = 4;
                case 4:
                    if (!(_i < dueSIPs_1.length)) return [3 /*break*/, 9];
                    sip = dueSIPs_1[_i];
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    console.log("Executing SIP ".concat(sip._id, " for ").concat(sip.schemeName));
                    return [4 /*yield*/, executeSIP(sip)];
                case 6:
                    execution = _a.sent();
                    results.executed++;
                    results.details.push({
                        id: sip._id,
                        scheme: sip.schemeName,
                        status: "success",
                        execution: execution
                    });
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error("Error executing SIP ".concat(sip._id, ":"), {
                        error: error_1,
                        message: error_1 instanceof Error ? error_1.message : "Unknown error",
                        stack: error_1 instanceof Error ? error_1.stack : undefined
                    });
                    results.failed++;
                    results.details.push({
                        id: sip._id,
                        scheme: sip.schemeName,
                        status: "failed",
                        error: error_1 instanceof Error ? error_1.message : "Unknown error"
                    });
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9:
                    console.log("SIP execution summary:", results);
                    return [2 /*return*/, results];
                case 10:
                    error_2 = _a.sent();
                    console.error("Error in executePendingSIPs:", {
                        error: error_2,
                        message: error_2 instanceof Error ? error_2.message : "Unknown error",
                        stack: error_2 instanceof Error ? error_2.stack : undefined
                    });
                    throw error_2;
                case 11: return [2 /*return*/];
            }
        });
    });
}
function executeSIP(sip) {
    return __awaiter(this, void 0, void 0, function () {
        var priceData, nav, units, sipExecution, existingHolding, totalInvestment, totalUnits, averagePrice, newHolding, nextExecutionDate, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("executeSIP - Starting for ".concat(sip.schemeName));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, , 14]);
                    // Get current NAV for the mutual fund
                    console.log("Fetching NAV for ".concat(sip.tradingsymbol));
                    return [4 /*yield*/, getMutualFundPrice(sip.tradingsymbol)];
                case 2:
                    priceData = _a.sent();
                    if (!priceData) {
                        throw new Error("Price data not found for ".concat(sip.tradingsymbol));
                    }
                    nav = priceData.last_price;
                    units = sip.amount / nav;
                    console.log("Calculated units: ".concat(units.toFixed(4), " at NAV \u20B9").concat(nav));
                    // Create SIP execution record
                    console.log("Creating SIP execution record");
                    return [4 /*yield*/, SIPExecution.create({
                            userId: sip.userId,
                            sipId: sip._id,
                            executionDate: new Date(),
                            amount: sip.amount,
                            nav: nav,
                            units: units,
                            status: "executed",
                        })];
                case 3:
                    sipExecution = _a.sent();
                    console.log("SIP execution record created:", sipExecution._id);
                    // Check if user already has holdings for this mutual fund
                    console.log("Checking for existing holdings");
                    return [4 /*yield*/, MutualFund.findOne({
                            userId: sip.userId,
                            tradingsymbol: sip.tradingsymbol,
                        })];
                case 4:
                    existingHolding = _a.sent();
                    if (!existingHolding) return [3 /*break*/, 7];
                    console.log("Updating existing holding");
                    totalInvestment = existingHolding.quantity * existingHolding.buyingPrice + sip.amount;
                    totalUnits = existingHolding.quantity + units;
                    averagePrice = totalInvestment / totalUnits;
                    return [4 /*yield*/, MutualFund.findByIdAndUpdate(existingHolding._id, {
                            quantity: totalUnits,
                            buyingPrice: averagePrice,
                        })];
                case 5:
                    _a.sent();
                    console.log("Existing holding updated:", {
                        totalUnits: totalUnits.toFixed(4),
                        averagePrice: averagePrice.toFixed(4)
                    });
                    // Update SIP execution with holding reference
                    return [4 /*yield*/, SIPExecution.findByIdAndUpdate(sipExecution._id, {
                            mutualFundHoldingId: existingHolding._id,
                        })];
                case 6:
                    // Update SIP execution with holding reference
                    _a.sent();
                    return [3 /*break*/, 10];
                case 7:
                    console.log("Creating new holding");
                    return [4 /*yield*/, MutualFund.create({
                            userId: sip.userId,
                            tradingsymbol: sip.tradingsymbol,
                            amc: priceData.amc,
                            schemeName: sip.schemeName,
                            schemeType: priceData.scheme_type,
                            plan: priceData.plan,
                            quantity: units,
                            buyingPrice: nav,
                            purchaseDate: new Date(),
                            brokerName: "SIP Auto-execution",
                        })];
                case 8:
                    newHolding = _a.sent();
                    console.log("New holding created:", newHolding._id);
                    // Update SIP execution with holding reference
                    return [4 /*yield*/, SIPExecution.findByIdAndUpdate(sipExecution._id, {
                            mutualFundHoldingId: newHolding._id,
                        })];
                case 9:
                    // Update SIP execution with holding reference
                    _a.sent();
                    _a.label = 10;
                case 10:
                    // Calculate next execution date
                    console.log("Calculating next execution date");
                    nextExecutionDate = new Date(sip.nextExecutionDate);
                    if (sip.frequency === "monthly") {
                        nextExecutionDate.setMonth(nextExecutionDate.getMonth() + 1);
                    }
                    else if (sip.frequency === "quarterly") {
                        nextExecutionDate.setMonth(nextExecutionDate.getMonth() + 3);
                    }
                    console.log("Next execution date:", nextExecutionDate.toISOString());
                    // Update SIP with next execution date
                    return [4 /*yield*/, SIP.findByIdAndUpdate(sip._id, {
                            nextExecutionDate: nextExecutionDate,
                        })];
                case 11:
                    // Update SIP with next execution date
                    _a.sent();
                    console.log("SIP updated with next execution date");
                    console.log("SIP executed successfully: ".concat(sip.schemeName, " - ").concat(units.toFixed(4), " units at \u20B9").concat(nav));
                    return [2 /*return*/, sipExecution];
                case 12:
                    error_3 = _a.sent();
                    console.error("Error executing SIP ".concat(sip._id, ":"), {
                        error: error_3,
                        message: error_3 instanceof Error ? error_3.message : "Unknown error",
                        stack: error_3 instanceof Error ? error_3.stack : undefined
                    });
                    // Create failed execution record
                    console.log("Creating failed execution record");
                    return [4 /*yield*/, SIPExecution.create({
                            userId: sip.userId,
                            sipId: sip._id,
                            executionDate: new Date(),
                            amount: sip.amount,
                            nav: 0,
                            units: 0,
                            status: "failed",
                            error: error_3 instanceof Error ? error_3.message : "Unknown error"
                        })];
                case 13:
                    _a.sent();
                    throw error_3;
                case 14: return [2 /*return*/];
            }
        });
    });
}
function getSIPExecutions(userId, sipId) {
    return __awaiter(this, void 0, void 0, function () {
        var query, executions, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("getSIPExecutions - Starting", { userId: userId, sipId: sipId });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    console.log("Connecting to database...");
                    return [4 /*yield*/, connectToDatabase()];
                case 2:
                    _a.sent();
                    console.log("Database connected successfully");
                    query = { userId: userId };
                    if (sipId) {
                        query.sipId = sipId;
                    }
                    console.log("Query:", query);
                    return [4 /*yield*/, SIPExecution.find(query)
                            .populate("sipId")
                            .sort({ executionDate: -1 })];
                case 3:
                    executions = _a.sent();
                    console.log("Found ".concat(executions.length, " executions"));
                    return [2 /*return*/, executions];
                case 4:
                    error_4 = _a.sent();
                    console.error("Error fetching SIP executions:", {
                        error: error_4,
                        message: error_4 instanceof Error ? error_4.message : "Unknown error",
                        stack: error_4 instanceof Error ? error_4.stack : undefined
                    });
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
module.exports = {
    executePendingSIPs: executePendingSIPs,
    executeSIP: executeSIP,
    getSIPExecutions: getSIPExecutions
};
