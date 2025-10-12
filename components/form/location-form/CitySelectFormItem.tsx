"use client";

import { useCities } from "@/lib/hooks/useLocation";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { LocationFormData, LOCATION_FORM_FIELDS } from "./constants";
import { FormField } from "@/components/ui/form";
import { Select } from "@/components/ui/select";

function CitySelectFormItem() {
  const { watch, setValue } = useFormContext<LocationFormData>();
  const value = watch(LOCATION_FORM_FIELDS.CITY_CODE);
  const countryCode = watch(LOCATION_FORM_FIELDS.COUNTRY_CODE);

  const { data: cityOptions = [], isLoading } = useCities(countryCode);

  // Reset city when country changes
  useEffect(() => {
    setValue(LOCATION_FORM_FIELDS.CITY_CODE, "");
  }, [countryCode, setValue]);

  const isDisabled = !countryCode || isLoading;

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
        placeholder={
          !countryCode
            ? "Select country first..."
            : isLoading
            ? "Loading cities..."
            : "Select city..."
        }
        disabled={isDisabled}
      />
    </FormField>
  );
}

export default CitySelectFormItem;
