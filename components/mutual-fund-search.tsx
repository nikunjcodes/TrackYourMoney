"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

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

interface MutualFundSearchProps {
  value?: string
  onSelect: (fund: MutualFund) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function MutualFundSearch({
  value,
  onSelect,
  placeholder = "Search mutual funds...",
  className,
  disabled = false,
}: MutualFundSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [funds, setFunds] = useState<MutualFund[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setFunds([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/mutual-funds/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) {
          throw new Error("Failed to search funds")
        }
        const data = await response.json()
        setFunds(data)
      } catch (error) {
        console.error("Error searching mutual funds:", error)
        setFunds([])
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
    if (open && funds.length === 0 && searchQuery.length === 0) {
      loadInitialFunds()
    }
  }, [open])

  const loadInitialFunds = async () => {
    setIsLoading(true)
    try {
      console.log("Loading initial mutual funds...")
      const response = await fetch("/api/mutual-funds?available=true")
      if (!response.ok) {
        throw new Error("Failed to fetch initial funds")
      }
      const data = await response.json()
      console.log(`Received ${data.length} initial funds`)
      setFunds(data)
    } catch (error) {
      console.error("Error loading initial funds:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (fund: MutualFund) => {
    setSelectedFund(fund)
    setOpen(false)
    setSearchQuery("")
    onSelect(fund)
  }

  const displayValue = selectedFund?.name || value || ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between border-gray-800 bg-black/50 text-left font-normal hover:bg-gray-900",
            !displayValue && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">{displayValue || placeholder}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 border-gray-800 bg-black" align="start">
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
                  {funds.map((fund) => (
                    <CommandItem
                      key={fund._id}
                      value={fund.name}
                      onSelect={() => handleSelect(fund)}
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
