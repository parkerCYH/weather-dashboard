"use client";

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
import { getAllMockCities, CityCoordinates } from "@/lib/mockCoordinates";

type CityOption = {
  value: string;
  label: string;
  coordinates: CityCoordinates;
};

type Props = {
  selectedCountry: string | undefined;
  selectedCity: string | undefined;
  onCityChange: (cityName: string, coordinates: CityCoordinates) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function CitySelect({
  selectedCountry,
  selectedCity,
  onCityChange,
  open,
  onOpenChange,
}: Props) {
  const cityOptions = useMemo<CityOption[]>(() => {
    // TODO: In production, fetch cities by country from API
    // For now, we use mock data
    const mockCities = getAllMockCities();

    // Filter cities by selected country if available
    // Note: This is a simplified filtering based on mock data
    // In production, you would fetch cities for the specific country
    return mockCities.map((city) => ({
      value: city.city,
      label: city.city,
      coordinates: city,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (value: string) => {
    // CommandItem's onSelect converts value to lowercase, so we need to find the original
    const selectedOption = cityOptions.find(
      (option) => option.label.toLowerCase() === value.toLowerCase()
    );
    if (selectedOption) {
      onCityChange(selectedOption.value, selectedOption.coordinates);
    }
    onOpenChange(false);
  };

  const isDisabled = !selectedCountry;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white text-gray-900 hover:bg-gray-50 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isDisabled}
        >
          {selectedCity
            ? cityOptions.find((option) => option.value === selectedCity)?.label
            : isDisabled
            ? "Select country first..."
            : "Select city..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command className="bg-white">
          <CommandInput 
            placeholder="Search city..." 
            className="text-gray-900 placeholder:text-gray-500"
          />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              {cityOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCity === option.value
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

export default CitySelect;
