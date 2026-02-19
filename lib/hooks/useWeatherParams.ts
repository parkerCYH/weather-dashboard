import { useQueryStates, parseAsString, parseAsStringLiteral } from "nuqs";
import { SEARCH_MODE_KEYS } from "@/components/form/constants";

/**
 * Unified hook for managing weather-related query parameters
 * Includes: mode, country, city, lat, lon
 */
export function useWeatherParams(options?: { scroll?: boolean }) {
    return useQueryStates(
        {
            mode: parseAsStringLiteral(SEARCH_MODE_KEYS).withDefault("dropdown"),
            country: parseAsString.withDefault(""),
            city: parseAsString.withDefault(""),
            lat: parseAsString,
            lon: parseAsString,
        },
        {
            history: "push",
            scroll: options?.scroll,
        }
    );
}
