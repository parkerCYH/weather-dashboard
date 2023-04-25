"use client";
import { City, Country } from "country-state-city";
import Select from "react-select";
import { GlobeIcon } from "@heroicons/react/solid";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isNil } from "ramda";

type CountryOption = {
  value: {
    latitude: string;
    longitude: string;
    isoCode: string;
  };
  label: string;
} | null;

type CityOption = {
  value: {
    latitude: string;
    longitude: string;
    countryCode: string;
    name: string;
    stateCode: string;
  };
  label: string;
} | null;
const options = Country.getAllCountries().map((country) => ({
  value: {
    latitude: country.latitude,
    longitude: country.longitude,
    isoCode: country.isoCode,
  },
  label: country.name,
}));

function CityPicker() {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>();
  const [selectedCity, setSelectedCity] = useState<CityOption>();
  const router = useRouter();

  const handleSelectedCountry = (option: CountryOption) => {
    setSelectedCountry(option);
    setSelectedCity(null);
  };
  const handleSelectedCity = (option: CityOption) => {
    setSelectedCity(option);

    router.push(
      `/location/${option?.value.name}/${option?.value.latitude}/${option?.value.longitude}`
    );
  };

  const cityOptions = useMemo(() => {
    if (!selectedCountry) {
      return [];
    }

    const cities = City.getCitiesOfCountry(selectedCountry.value.isoCode);
    if (!cities) {
      return [];
    }

    const filteredCities = cities.filter((city) => {
      if (isNil(city.latitude) || isNil(city.longitude)) {
        console.warn(`${city.name} has undefined latitude or longitude`);
        return false;
      }
      return true;
    });

    return filteredCities.map((city) => ({
      value: {
        latitude: city.latitude!,
        longitude: city.longitude!,
        countryCode: city.countryCode,
        name: city.name,
        stateCode: city.stateCode,
      },
      label: city.name,
    }));
  }, [selectedCountry]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-white/80">
          <GlobeIcon className=" h-5 w-5  text-white" />
          <label htmlFor="country">Country</label>
        </div>
        <Select
          className=" text-black"
          options={options}
          onChange={handleSelectedCountry}
          value={selectedCountry}
        />
      </div>
      {selectedCountry && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-white/80">
            <GlobeIcon className=" h-5 w-5  text-white" />
            <label htmlFor="city">City</label>
          </div>
          <Select
            className=" text-black"
            onChange={handleSelectedCity}
            value={selectedCity}
            options={cityOptions}
          />
        </div>
      )}
    </div>
  );
}

export default CityPicker;
