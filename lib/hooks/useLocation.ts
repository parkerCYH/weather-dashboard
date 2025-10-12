import { useQuery } from "@tanstack/react-query";
import { getAllCountries, getCitiesByCountry } from "@/lib/api";

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
