"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AddMutualFundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

interface MutualFund {
  _id: string
  tradingsymbol: string
  amc: string
  name: string
  minimum_purchase_amount: number
  scheme_type: string
  plan: string
  last_price: number
  last_price_date: Date
}

export default function AddMutualFundDialog({ open, onOpenChange, onSubmit }: AddMutualFundDialogProps) {
  const [formData, setFormData] = useState({
    tradingsymbol: "",
    amc: "",
    schemeName: "",
    schemeType: "",
    plan: "",
    quantity: "",
    buyingPrice: "",
    purchaseDate: "",
    brokerName: "",
  })
  const [availableFunds, setAvailableFunds] = useState<MutualFund[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [openCombobox, setOpenCombobox] = useState(false)
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setAvailableFunds([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/mutual-funds/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) {
          throw new Error("Failed to search funds")
        }
        const data = await response.json()
        setAvailableFunds(data)
      } catch (error) {
        console.error("Error searching mutual funds:", error)
        setAvailableFunds([])
      } finally {
        setIsLoading(false)
      }
    }, 300),
    [],
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

  // Load initial funds when opened
  useEffect(() => {
    if (openCombobox && availableFunds.length === 0 && searchQuery.length === 0) {
      fetchAvailableFunds()
    }
  }, [openCombobox])

  const fetchAvailableFunds = async () => {
    setIsLoading(true)
    try {
      console.log("Fetching available mutual funds...")
      const response = await fetch("/api/mutual-funds?available=true")
      if (!response.ok) {
        throw new Error("Failed to fetch funds")
      }
      const data = await response.json()
      console.log(`Received ${data.length} available funds`)
      setAvailableFunds(data)
    } catch (error) {
      console.error("Error fetching available funds:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFundSelect = (fund: MutualFund) => {
    setSelectedFund(fund)
    setOpenCombobox(false)
    setSearchQuery("")
    setFormData((prev) => ({
      ...prev,
      tradingsymbol: fund.tradingsymbol,
      amc: fund.amc,
      schemeName: fund.name,
      schemeType: fund.scheme_type,
      plan: fund.plan,
      buyingPrice: fund.last_price.toString(),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        ...formData,
        quantity: Number.parseFloat(formData.quantity),
        buyingPrice: Number.parseFloat(formData.buyingPrice),
      })

      // Reset form
      setFormData({
        tradingsymbol: "",
        amc: "",
        schemeName: "",
        schemeType: "",
        plan: "",
        quantity: "",
        buyingPrice: "",
        purchaseDate: "",
        brokerName: "",
      })
    } catch (error) {
      console.error("Error adding mutual fund:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray-800 bg-black text-white sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Mutual Fund Holding</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new mutual fund holding to your portfolio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fund-search">Search Mutual Fund</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className={cn(
                    "w-full justify-between border-gray-800 bg-black/50 text-left font-normal hover:bg-gray-900",
                    !selectedFund && "text-muted-foreground",
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Search className="h-4 w-4 shrink-0 opacity-50" />
                    <span className="truncate">
                      {selectedFund?.name || "Search mutual funds..."}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 border-gray-800 bg-black" align="start">
                <Command className="bg-black">
                  <CommandInput
                    placeholder="Type to search mutual funds..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    className="border-gray-800 bg-black text-white placeholder:text-gray-400"
                  />
                  <CommandList className="max-h-[300px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                        <span className="ml-2 text-sm text-gray-400">Searching...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty className="py-6 text-center text-sm text-gray-400">
                          {searchQuery.length < 2 ? "Type at least 2 characters to search" : "No mutual funds found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableFunds.map((fund) => (
                            <CommandItem
                              key={fund._id}
                              value={fund.name}
                              onSelect={() => handleFundSelect(fund)}
                              className="cursor-pointer hover:bg-gray-900 aria-selected:bg-gray-800"
                            >
                              <div className="flex w-full items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-white truncate">{fund.name}</p>
                                    <Badge variant="outline" className="text-xs shrink-0">
                                      {fund.scheme_type}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="truncate">{fund.amc}</span>
                                    <span>•</span>
                                    <span className="font-mono">{fund.tradingsymbol}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                    <span>NAV: ₹{fund.last_price.toFixed(4)}</span>
                                    <span>•</span>
                                    <span>Min: ₹{fund.minimum_purchase_amount.toLocaleString()}</span>
                                  </div>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-2 h-4 w-4 shrink-0",
                                    selectedFund?._id === fund._id ? "opacity-100" : "opacity-0",
                                  )}
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity/Units</Label>
              <Input
                id="quantity"
                type="number"
                step="0.001"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                className="border-gray-800 bg-black/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyingPrice">Buying Price (NAV)</Label>
              <Input
                id="buyingPrice"
                type="number"
                step="0.0001"
                value={formData.buyingPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, buyingPrice: e.target.value }))}
                className="border-gray-800 bg-black/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, purchaseDate: e.target.value }))}
                className="border-gray-800 bg-black/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brokerName">Broker Name</Label>
              <Input
                id="brokerName"
                value={formData.brokerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, brokerName: e.target.value }))}
                className="border-gray-800 bg-black/50"
                placeholder="Optional"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Adding..." : "Add Holding"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
