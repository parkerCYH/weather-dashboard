"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetCoordinates } from "@/lib/hooks/useLocation";
import { useForm } from "react-hook-form";
import { Loader2, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CitySelectFormItem from "./CitySelectFormItem";
import CountrySelectFormItem from "./CountrySelectFormItem";
import { LocationFormData } from "./constants";
import { useRouter } from "next/navigation";
import { useWeatherParams } from "@/lib/hooks/useWeatherParams";

function LocationForm() {
  const router = useRouter();
  const [{ country, city, mode }] = useWeatherParams();

  const form = useForm<LocationFormData>({
    mode: "onChange",
    defaultValues: {
      countryCode: country,
      cityCode: city,
    },
  });

  const mutation = useGetCoordinates();

  useEffect(() => {
    if (mutation.isSuccess && mutation.variables) {
      router.push(
        `/weather-dashboard?country=${mutation.variables.countryCode}&city=${mutation.variables.cityCode}&mode=${mode}`
      );
    }
  }, [mutation.isSuccess, mutation.variables, mode, router]);

  const onSubmit = async (data: LocationFormData) => {
    if (!data.countryCode || !data.cityCode) return;
    mutation.mutate({ countryCode: data.countryCode, cityCode: data.cityCode });
  };

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-4">
      {mutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to fetch coordinates. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <CountrySelectFormItem />

      <CitySelectFormItem />

      <Button
        type="submit"
        className="w-full mt-4 bg-white text-black"
        variant="default"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          "Go"
        )}
      </Button>
    </Form>
  );
}

export default LocationForm;
