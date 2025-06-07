"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const insuranceTypes = [
  { value: "health", label: "Health Insurance" },
  { value: "life", label: "Life Insurance" },
  { value: "vehicle", label: "Vehicle Insurance" },
  { value: "home", label: "Home Insurance" },
  { value: "other", label: "Other" },
]

const premiumFrequencies = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half-yearly", label: "Half-Yearly" },
  { value: "yearly", label: "Yearly" },
]

interface AddInsuranceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export default function AddInsuranceDialog({ open, onOpenChange, onSubmit }: AddInsuranceDialogProps) {
  const [formData, setFormData] = useState({
    type: "",
    provider: "",
    policyNumber: "",
    sumAssured: "",
    premium: "",
    premiumFrequency: "yearly",
    startDate: "",
    endDate: "",
    nextDueDate: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useState(() => {
    if (open) {
      // Set default dates
      const today = new Date().toISOString().split("T")[0]
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      const endDate = oneYearFromNow.toISOString().split("T")[0]

      setFormData((prev) => ({
        ...prev,
        startDate: today,
        endDate: endDate,
        nextDueDate: today,
      }))
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        ...formData,
        sumAssured: Number.parseFloat(formData.sumAssured),
        premium: Number.parseFloat(formData.premium),
      })

      // Reset form
      setFormData({
        type: "",
        provider: "",
        policyNumber: "",
        sumAssured: "",
        premium: "",
        premiumFrequency: "yearly",
        startDate: "",
        endDate: "",
        nextDueDate: "",
      })
    } catch (error) {
      console.error("Error adding insurance policy:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray-800 bg-black text-white sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Insurance Policy</DialogTitle>
          <DialogDescription className="text-gray-400">Add a new insurance policy to your portfolio</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Insurance Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="border-gray-800 bg-black/50">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="border-gray-800 bg-black">
                  {insuranceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Insurance Provider</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData((prev) => ({ ...prev, provider: e.target.value }))}
                className="border-gray-800 bg-black/50"
                placeholder="e.g., HDFC ERGO, LIC"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policyNumber">Policy Number</Label>
            <Input
              id="policyNumber"
              value={formData.policyNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, policyNumber: e.target.value }))}
              className="border-gray-800 bg-black/50"
              placeholder="Policy number"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sumAssured">Sum Assured</Label>
              <Input
                id="sumAssured"
                type="number"
                step="10000"
                min="0"
                value={formData.sumAssured}
                onChange={(e) => setFormData((prev) => ({ ...prev, sumAssured: e.target.value }))}
                className="border-gray-800 bg-black/50"
                placeholder="₹500,000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="premium">Premium Amount</Label>
              <Input
                id="premium"
                type="number"
                step="100"
                min="0"
                value={formData.premium}
                onChange={(e) => setFormData((prev) => ({ ...prev, premium: e.target.value }))}
                className="border-gray-800 bg-black/50"
                placeholder="₹10,000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="premiumFrequency">Premium Frequency</Label>
            <Select
              value={formData.premiumFrequency}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, premiumFrequency: value }))}
            >
              <SelectTrigger className="border-gray-800 bg-black/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-gray-800 bg-black">
                {premiumFrequencies.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                className="border-gray-800 bg-black/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                className="border-gray-800 bg-black/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextDueDate">Next Due Date</Label>
              <Input
                id="nextDueDate"
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, nextDueDate: e.target.value }))}
                className="border-gray-800 bg-black/50"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Adding..." : "Add Policy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
