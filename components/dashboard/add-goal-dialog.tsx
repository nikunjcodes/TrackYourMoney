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

const goalCategories = [
  { value: "education", label: "Education" },
  { value: "retirement", label: "Retirement" },
  { value: "home", label: "Home" },
  { value: "vehicle", label: "Vehicle" },
  { value: "travel", label: "Travel" },
  { value: "other", label: "Other" },
]

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

interface AddGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export default function AddGoalDialog({ open, onOpenChange, onSubmit }: AddGoalDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    category: "other",
    priority: "medium",
  })
  const [isLoading, setIsLoading] = useState(false)

  useState(() => {
    if (open) {
      // Set default target date to 1 year from now
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      const defaultDate = oneYearFromNow.toISOString().split("T")[0]
      setFormData((prev) => ({ ...prev, targetDate: defaultDate }))
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        ...formData,
        targetAmount: Number.parseFloat(formData.targetAmount),
        currentAmount: Number.parseFloat(formData.currentAmount) || 0,
      })

      // Reset form
      setFormData({
        name: "",
        targetAmount: "",
        currentAmount: "",
        targetDate: "",
        category: "other",
        priority: "medium",
      })
    } catch (error) {
      console.error("Error adding goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray-800 bg-black text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Financial Goal</DialogTitle>
          <DialogDescription className="text-gray-400">Set a new financial milestone to work towards</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="border-gray-800 bg-black/50"
              placeholder="e.g., Emergency Fund, House Down Payment"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="border-gray-800 bg-black/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-800 bg-black">
                  {goalCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="border-gray-800 bg-black/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-800 bg-black">
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <Input
                id="targetAmount"
                type="number"
                step="1000"
                min="0"
                value={formData.targetAmount}
                onChange={(e) => setFormData((prev) => ({ ...prev, targetAmount: e.target.value }))}
                className="border-gray-800 bg-black/50"
                placeholder="₹100,000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAmount">Current Amount</Label>
              <Input
                id="currentAmount"
                type="number"
                step="1000"
                min="0"
                value={formData.currentAmount}
                onChange={(e) => setFormData((prev) => ({ ...prev, currentAmount: e.target.value }))}
                className="border-gray-800 bg-black/50"
                placeholder="₹0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, targetDate: e.target.value }))}
              className="border-gray-800 bg-black/50"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Creating..." : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
