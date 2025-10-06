"use client";

import { getCitiesByCountry } from "@/lib/mockCoordinates";
import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { LocationFormData, LOCATION_FORM_FIELDS } from "./constants";
import { FormField } from "@/components/ui/form";
import { Select } from "@/components/ui/select";

function CitySelectFormItem() {
  const { watch, setValue } = useFormContext<LocationFormData>();

  const value = watch(LOCATION_FORM_FIELDS.CITY_CODE);

  const cityOptions = CitySelectFormItem.useOptions();

  const isDisabled = CitySelectFormItem.useDisabled();

  CitySelectFormItem.useImpact();
  return (
    <FormField
      name={LOCATION_FORM_FIELDS.CITY_CODE}
      label="City"
      rules={{ required: "City is required" }}
    >
      <Select
        value={value}
        onValueChange={(newValue) =>
          setValue(LOCATION_FORM_FIELDS.CITY_CODE, newValue)
        }
        options={cityOptions}
        placeholder="Select country first..."
        disabled={isDisabled}
      />
    </FormField>
  );
}

CitySelectFormItem.useImpact = () => {
  const { watch, setValue } = useFormContext<LocationFormData>();
  const countryCode = watch(LOCATION_FORM_FIELDS.COUNTRY_CODE);
  useEffect(() => {
    setValue(LOCATION_FORM_FIELDS.CITY_CODE, "");
  }, [countryCode, setValue]);
};

CitySelectFormItem.useOptions = () => {
  const { watch } = useFormContext<LocationFormData>();
  const countryCode = watch(LOCATION_FORM_FIELDS.COUNTRY_CODE);
  return useMemo(() => {
    if (!countryCode) return [];
    return getCitiesByCountry(countryCode);
  }, [countryCode]);
};

CitySelectFormItem.useDisabled = () => {
  const { watch, setValue } = useFormContext<LocationFormData>();
  const countryCode = watch(LOCATION_FORM_FIELDS.COUNTRY_CODE);
  return useMemo(() => {
    if (!countryCode) return true;
    return false;
  }, [countryCode]);
};

export default CitySelectFormItem;
