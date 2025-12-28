import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllCountries, getCitiesByCountry, getCoordinates } from "@/lib/api";

/**
 * Hook to fetch all countries
 */
export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: getAllCountries,
  });
}

/**
 * Hook to fetch cities by country code
 */
export function useCities(countryCode: string | undefined) {
  return useQuery({
    queryKey: ["cities", countryCode],
    queryFn: () => getCitiesByCountry(countryCode!),
    enabled: !!countryCode,
  });
}

/**
 * Hook to fetch coordinates by country and city code
 */
export function useGetCoordinates() {
  return useMutation({
    mutationFn: ({ countryCode, cityCode }: { countryCode: string; cityCode: string }) =>
      getCoordinates(countryCode, cityCode),
  });
}
