"use client";

import { useCountries } from "@/lib/hooks/useLocation";
import { useFormContext } from "react-hook-form";
import { LocationFormData, LOCATION_FORM_FIELDS } from "./constants";
import { FormField } from "@/components/ui/form";
import { Select } from "@/components/ui/select";

function CountrySelectFormItem() {
  const { watch, setValue } = useFormContext<LocationFormData>();
  const value = watch(LOCATION_FORM_FIELDS.COUNTRY_CODE);

  const { data: countryOptions = [], isLoading } = useCountries();

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
        placeholder={isLoading ? "Loading countries..." : "Select country..."}
        disabled={isLoading}
      />
    </FormField>
  );
}

export default CountrySelectFormItem;
