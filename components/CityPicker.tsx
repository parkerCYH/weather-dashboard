"use client";
import { City, Country } from "country-state-city";
import { Select } from "antd";
import { GlobeIcon } from "@heroicons/react/solid";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isEmpty, isNil, isNotNil } from "ramda";
import { Button } from "@tremor/react";

const options = Country.getAllCountries().map((country) => ({
  value: country.isoCode,
  label: country.name,
}));

function CityPicker() {
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [selectedCity, setSelectedCity] = useState<string | null>();
  const router = useRouter();

  const handleSelectedCountry = (option: string) => {
    setSelectedCountry(option);
    setSelectedCity(null);
  };
  const handleSelectedCity = (option: string) => {
    setSelectedCity(option);
  };

  const cityOptions = useMemo(() => {
    if (!selectedCountry) {
      return [];
    }

    const cities = City.getCitiesOfCountry(selectedCountry);

    if (isEmpty(cities) || isNil(cities)) {
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
      value: `${city.name}/${city.latitude}/${city.longitude}`,
      label: city.name,
    }));
  }, [selectedCountry]);
  const locationPath = useMemo(() => {
    if (isNil(selectedCountry)) {
      return "";
    }
    const cities = City.getCitiesOfCountry(selectedCountry);
    if (isNil(selectedCity) && isNotNil(selectedCountry) && isNotNil(cities)) {
      const countryInfo = Country.getCountryByCode(selectedCountry);
      if (isNotNil(countryInfo)) {
        const { name, latitude, longitude } = countryInfo;
        return `${name}/${latitude}/${longitude}`;
      }
      return "";
    }
    if (isNotNil(selectedCity)) {
      return selectedCity;
    }
    return "";
  }, [selectedCity, selectedCountry]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-white/80">
          <GlobeIcon className=" h-5 w-5  text-white" />
          <label htmlFor="country">Country</label>
        </div>
        <Select
          className=" text-black w-full"
          options={options}
          placeholder="Click to Select"
          onChange={handleSelectedCountry}
          value={selectedCountry}
        />
      </div>
      {!isNil(selectedCountry) && !isEmpty(cityOptions) && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-white/80">
            <GlobeIcon className=" h-5 w-5  text-white" />
            <label htmlFor="city">City</label>
          </div>
          <Select
            className=" text-black w-full"
            placeholder="Click to Select"
            onChange={handleSelectedCity}
            value={selectedCity}
            options={cityOptions}
          />
        </div>
      )}

      <div className="pt-4">
        <Button
          className=" w-full space-y-4"
          color="slate"
          size="xs"
          disabled={isEmpty(locationPath)}
          onClick={() => {
            router.push(`/location/${locationPath}`);
          }}
        >
          Go
        </Button>
      </div>
    </div>
  );
}

export default CityPicker;
