"use client";

import { useCities } from "@/lib/hooks/useLocation";
import { useEffect, useRef } from "react";
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

function CitySelectFormItem() {
  const { control, setValue } = useFormContext<LocationFormData>();
  const value = useWatch({ name: LOCATION_FORM_FIELDS.CITY_CODE, control });
  const countryCode = useWatch({ name: LOCATION_FORM_FIELDS.COUNTRY_CODE, control });
  const previousCountryCode = useRef(countryCode);

  const { data: cityOptions = [], isLoading } = useCities(countryCode);


  useEffect(() => {
    if (previousCountryCode.current !== countryCode && previousCountryCode.current !== undefined) {
      setValue(LOCATION_FORM_FIELDS.CITY_CODE, "");
    }
    previousCountryCode.current = countryCode;
  }, [countryCode, setValue]);

  const isDisabled = !countryCode || isLoading;

  const getTooltipMessage = () => {
    if (!countryCode) {
      return "請先選擇國家";
    }
    if (isLoading) {
      return "正在載入城市列表...";
    }
    return null;
  };

  const tooltipMessage = getTooltipMessage();

  return (
    <FormField
      name={LOCATION_FORM_FIELDS.CITY_CODE}
      label="City"
      rules={{ required: "City is required" }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
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
            </div>
          </TooltipTrigger>
          {tooltipMessage && (
            <TooltipContent>
              <p>{tooltipMessage}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </FormField>
  );
}

export default CitySelectFormItem;
