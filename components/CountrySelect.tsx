"use client";

import { Countries } from "countries-geo";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type CountryOption = {
  id: string;
  value: string;
  label: string;
};

type Props = {
  selectedCountry: string | undefined;
  onCountryChange: (countryIso: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function CountrySelect({
  selectedCountry,
  onCountryChange,
  open,
  onOpenChange,
}: Props) {
  const countryOptions = useMemo<CountryOption[]>(() => {
    const countries = Countries.getAll;
    
    // Remove duplicates and create unique IDs
    const seen = new Map<string, CountryOption>();
    
    countries.forEach((country, index) => {
      const key = `${country.iso}-${country.name}`;
      if (!seen.has(key)) {
        seen.set(key, {
          id: `${country.iso}-${index}`, // Unique ID combining ISO and index
          value: country.iso,
          label: country.name,
        });
      }
    });
    
    return Array.from(seen.values());
  }, []);

  const handleSelect = (value: string) => {
    // CommandItem's onSelect converts value to lowercase, so we need to find the original
    const selectedOption = countryOptions.find(
      (option) => option.value.toLowerCase() === value.toLowerCase()
    );
    if (selectedOption) {
      onCountryChange(selectedOption.value);
    }
    onOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white text-gray-900 hover:bg-gray-50 border-gray-300"
        >
          {selectedCountry
            ? countryOptions.find((option) => option.value === selectedCountry)
                ?.label
            : "Select country..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command className="bg-white">
          <CommandInput 
            placeholder="Search country..." 
            className="text-gray-900 placeholder:text-gray-500"
          />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countryOptions.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.label}
                  onSelect={(currentValue) => {
                    const selected = countryOptions.find(
                      (opt) =>
                        opt.label.toLowerCase() === currentValue.toLowerCase()
                    );
                    if (selected) {
                      handleSelect(selected.value);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCountry === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CountrySelect;
