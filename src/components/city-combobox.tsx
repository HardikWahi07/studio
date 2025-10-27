
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { findCities } from "@/ai/flows/find-cities"
import { useDebounce } from "@/hooks/use-debounce"

interface CityComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CityCombobox({ value, onValueChange, placeholder }: CityComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  React.useEffect(() => {
    if (debouncedSearchTerm.length > 1) {
      const fetchCities = async () => {
        setIsLoading(true)
        try {
          const result = await findCities({ query: debouncedSearchTerm })
          setSuggestions(result.cities)
        } catch (error) {
          console.error("Failed to fetch cities:", error)
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      }
      fetchCities()
    } else {
      setSuggestions([])
    }
  }, [debouncedSearchTerm])

  const handleSelect = (currentValue: string) => {
    onValueChange(currentValue === value ? "" : currentValue)
    setSearchTerm("")
    setSuggestions([])
    setOpen(false)
  }

  // Find the full city name from suggestions or use the passed value
  const displayValue = suggestions.find(city => city.toLowerCase() === value) || value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? displayValue.split(',')[0] : placeholder || "Select city..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Search city..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading && (
              <div className="p-2 flex justify-center items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!isLoading && debouncedSearchTerm.length > 1 && suggestions.length === 0 && (
              <CommandEmpty>No city found.</CommandEmpty>
            )}
            <CommandGroup>
              {suggestions.map((city) => (
                <CommandItem
                  key={city}
                  value={city}
                  onSelect={() => handleSelect(city.toLowerCase())}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === city.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {city}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
