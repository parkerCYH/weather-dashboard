// API functions for fetching location data from the database
// This replaces the mock data in mockCoordinates.ts

type Country = {
  id: number;
  code: string;
  name: string;
};

type City = {
  id: number;
  code: string;
  name: string;
  countryId: number;
};

type CityCoordinates = {
  cityCode: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
};

/**
 * API 1: Get all countries
 * @returns Array of all available countries
 */
export async function getAllCountries(): Promise<Country[]> {
  const response = await fetch('/api/countries', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch countries');
  }

  return response.json();
}

/**
 * API 2: Get all cities by country code
 * @param countryCode - The country code (e.g., "CN", "US")
 * @returns Array of cities in the specified country
 */
export async function getCitiesByCountry(countryCode: string): Promise<City[]> {
  const response = await fetch(`/api/countries/${countryCode}/cities`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cities for country ${countryCode}`);
  }

  return response.json();
}

/**
 * API 3: Get coordinates by country and city code
 * @param countryCode - The country code (e.g., "CN", "US")
 * @param cityCode - The city code (e.g., "BJ", "NYC")
 * @returns Coordinates object
 */
export async function getCoordinates(
  countryCode: string,
  cityCode: string
): Promise<CityCoordinates> {
  const response = await fetch(
    `/api/countries/${countryCode}/cities/${cityCode}/coordinates`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch coordinates for ${cityCode}, ${countryCode}`
    );
  }

  return response.json();
}

export type { Country, City, CityCoordinates };
