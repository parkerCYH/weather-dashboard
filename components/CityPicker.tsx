"use client";
import { City, Country } from "country-state-city";
import Select from "react-select";
import { GlobeIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
      `/location/${option?.value.latitude}/${option?.value.longitude}`
    );
  };

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
            options={City.getCitiesOfCountry(
              selectedCountry.value.isoCode
            )?.map((state) => ({
              value: {
                latitude: state.latitude,
                longitude: state.longitude,
                countryCode: state.countryCode,
                name: state.name,
                stateCode: state.stateCode,
              },
              label: state.name,
            }))}
          />
        </div>
      )}
    </div>
  );
}

export default CityPicker;
