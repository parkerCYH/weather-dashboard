"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import CountrySelect from "./CountrySelect";
import CitySelect from "./CitySelect";
import { CityCoordinates } from "@/lib/mockCoordinates";

type LocationFormData = {
  country: string;
  city: string;
  coordinates?: CityCoordinates;
};

function LocationSelector() {
  const [openCountry, setOpenCountry] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const router = useRouter();

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<LocationFormData>({
    mode: "onChange",
    defaultValues: {
      country: "",
      city: "",
      coordinates: undefined,
    },
  });

  const selectedCountry = watch("country");
  const selectedCity = watch("city");
  const cityCoordinates = watch("coordinates");

  const handleCountryChange = (countryIso: string) => {
    setValue("country", countryIso, { shouldValidate: true });
    setValue("city", "", { shouldValidate: true });
    setValue("coordinates", undefined, { shouldValidate: true });
  };

  const handleCityChange = (cityName: string, coordinates: CityCoordinates) => {
    setValue("city", cityName, { shouldValidate: true });
    setValue("coordinates", coordinates, { shouldValidate: true });
  };

  const onSubmit = (data: LocationFormData) => {
    if (data.coordinates) {
      router.push(
        `/location/${data.coordinates.city}/${data.coordinates.latitude}/${data.coordinates.longitude}`
      );
    }
  };

  const isGoDisabled = !cityCoordinates || !isValid;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-white/80">
          <Globe className="h-5 w-5 text-white" />
          <label htmlFor="country">Country</label>
        </div>
        <CountrySelect
          selectedCountry={selectedCountry}
          onCountryChange={handleCountryChange}
          open={openCountry}
          onOpenChange={setOpenCountry}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-white/80">
          <Globe className="h-5 w-5 text-white" />
          <label htmlFor="city">City</label>
        </div>
        <CitySelect
          selectedCountry={selectedCountry}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          open={openCity}
          onOpenChange={setOpenCity}
        />
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          variant="secondary"
          disabled={isGoDisabled}
        >
          Go
        </Button>
      </div>
    </form>
  );
}

export default LocationSelector;
