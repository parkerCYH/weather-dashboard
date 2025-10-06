"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { getCoordinates } from "@/lib/mockCoordinates";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import CitySelectFormItem from "./CitySelectFormItem";
import CountrySelectFormItem from "./CountrySelectFormItem";
import { LocationFormData } from "./constants";

function LocationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<LocationFormData>({
    mode: "onChange",
    defaultValues: {
      countryCode: searchParams.get("country") || "",
      cityCode: searchParams.get("city") || "",
    },
  });

  const onSubmit = async (data: LocationFormData) => {
    if (!data.countryCode || !data.cityCode) return;
    const coordinates = getCoordinates(data.countryCode, data.cityCode);

    if (coordinates) {
      router.push(
        `/location/weather?country=${data.countryCode}&city=${data.cityCode}` as any
      );
    } else {
      console.error("Coordinates not found for the selected location");
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-4">
      <CountrySelectFormItem />

      <CitySelectFormItem />

      <Button
        type="submit"
        className="w-full mt-4 bg-white text-black"
        variant="default"
      >
        Go
      </Button>
    </Form>
  );
}

export default LocationForm;
