"use client";

import { getAllCountries } from "@/lib/mockCoordinates";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { LocationFormData, LOCATION_FORM_FIELDS } from "./constants";
import { FormField } from "@/components/ui/form";
import { Select } from "@/components/ui/select";

function CountrySelectFormItem() {
  const { watch, setValue } = useFormContext<LocationFormData>();
  const value = watch(LOCATION_FORM_FIELDS.COUNTRY_CODE);

  const countryOptions = useMemo(() => {
    return getAllCountries();
  }, []);

  return (
    <FormField
      name={LOCATION_FORM_FIELDS.COUNTRY_CODE}
      label="Country"
      rules={{ required: "Country is required" }}
    >
      <Select
        value={value}
        onValueChange={(newValue) =>
          setValue(LOCATION_FORM_FIELDS.COUNTRY_CODE, newValue)
        }
        options={countryOptions}
        placeholder="Select country..."
      />
    </FormField>
  );
}

export default CountrySelectFormItem;
