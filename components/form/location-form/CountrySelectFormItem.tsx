"use client";

import { useCountries } from "@/lib/hooks/useLocation";
import { useFormContext, useWatch } from "react-hook-form";
import { LocationFormData, LOCATION_FORM_FIELDS } from "./constants";
import { FormField } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function CountrySelectFormItem() {
  const { control, setValue } = useFormContext<LocationFormData>();
  const countryCode = useWatch({ name: LOCATION_FORM_FIELDS.COUNTRY_CODE, control });

  const { data: countryOptions = [], isLoading } = useCountries();

  return (
    <FormField
      name={LOCATION_FORM_FIELDS.COUNTRY_CODE}
      label="Country"
      rules={{ required: "Country is required" }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Select
                value={countryCode}
                onValueChange={(newValue) =>
                  setValue(LOCATION_FORM_FIELDS.COUNTRY_CODE, newValue)
                }
                options={countryOptions}
                placeholder={isLoading ? "Loading countries..." : "Select country..."}
                disabled={isLoading}
              />
            </div>
          </TooltipTrigger>
          {isLoading && (
            <TooltipContent>
              <p>正在載入國家列表...</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </FormField>
  );
}

export default CountrySelectFormItem;
