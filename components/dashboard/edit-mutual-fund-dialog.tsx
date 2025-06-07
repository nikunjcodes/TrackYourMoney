"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MutualFund {
  _id: string
  schemeName: string
  amc: string
  tradingsymbol: string
  schemeType: string
  plan: string
  quantity: number
  buyingPrice: number
  purchaseDate: string
  currentValue?: number
  lastPrice?: number
  lastPriceDate?: string
}

interface EditMutualFundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<MutualFund>) => Promise<void>
  mutualFund: MutualFund | null
}

export default function EditMutualFundDialog({ open, onOpenChange, onSubmit, mutualFund }: EditMutualFundDialogProps) {
  const [formData, setFormData] = useState<Partial<MutualFund>>({})

  useEffect(() => {
    if (mutualFund) {
      setFormData({
        schemeName: mutualFund.schemeName,
        amc: mutualFund.amc,
        tradingsymbol: mutualFund.tradingsymbol,
        schemeType: mutualFund.schemeType,
        plan: mutualFund.plan,
        quantity: mutualFund.quantity,
        buyingPrice: mutualFund.buyingPrice,
        purchaseDate: mutualFund.purchaseDate.split("T")[0],
        lastPrice: mutualFund.lastPrice,
        lastPriceDate: mutualFund.lastPriceDate?.split("T")[0],
      })
    }
  }, [mutualFund])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mutualFund?._id) {
      await onSubmit({ ...formData, _id: mutualFund._id })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Mutual Fund Holding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schemeName">Scheme Name</Label>
            <Input
              id="schemeName"
              value={formData.schemeName || ""}
              onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amc">AMC</Label>
            <Input
              id="amc"
              value={formData.amc || ""}
              onChange={(e) => setFormData({ ...formData, amc: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tradingsymbol">Trading Symbol</Label>
            <Input
              id="tradingsymbol"
              value={formData.tradingsymbol || ""}
              onChange={(e) => setFormData({ ...formData, tradingsymbol: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schemeType">Scheme Type</Label>
              <Select
                value={formData.schemeType}
                onValueChange={(value) => setFormData({ ...formData, schemeType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Debt">Debt</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Liquid">Liquid</SelectItem>
                  <SelectItem value="Index">Index</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <Select
                value={formData.plan}
                onValueChange={(value) => setFormData({ ...formData, plan: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Direct">Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Units</Label>
              <Input
                id="quantity"
                type="number"
                step="0.001"
                value={formData.quantity || ""}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyingPrice">Buy Price (₹)</Label>
              <Input
                id="buyingPrice"
                type="number"
                step="0.01"
                value={formData.buyingPrice || ""}
                onChange={(e) => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate || ""}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastPrice">Current NAV (₹)</Label>
              <Input
                id="lastPrice"
                type="number"
                step="0.01"
                value={formData.lastPrice || ""}
                onChange={(e) => setFormData({ ...formData, lastPrice: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastPriceDate">NAV Date</Label>
              <Input
                id="lastPriceDate"
                type="date"
                value={formData.lastPriceDate || ""}
                onChange={(e) => setFormData({ ...formData, lastPriceDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 