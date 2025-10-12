// Server-side API functions for fetching location data
// Use these in Server Components for better performance

import { prisma } from '@/lib/prisma';

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
 * Server-side: Get all countries
 * @returns Array of all available countries
 */
export async function getAllCountries(): Promise<Country[]> {
  return await prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

/**
 * Server-side: Get all cities by country code
 * @param countryCode - The country code (e.g., "CN", "US")
 * @returns Array of cities in the specified country
 */
export async function getCitiesByCountry(countryCode: string): Promise<City[]> {
  const country = await prisma.country.findUnique({
    where: {
      code: countryCode.toUpperCase(),
    },
    include: {
      cities: {
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  return country?.cities || [];
}

/**
 * Server-side: Get coordinates by country and city code
 * @param countryCode - The country code (e.g., "CN", "US")
 * @param cityCode - The city code (e.g., "BJ", "NYC")
 * @returns Coordinates object or null if not found
 */
export async function getCoordinates(
  countryCode: string,
  cityCode: string
): Promise<CityCoordinates | null> {
  const city = await prisma.city.findFirst({
    where: {
      code: cityCode.toUpperCase(),
      country: {
        code: countryCode.toUpperCase(),
      },
    },
    include: {
      coordinates: true,
      country: true,
    },
  });

  if (!city || !city.coordinates) {
    return null;
  }

  return {
    cityCode: city.code,
    cityName: city.name,
    countryCode: city.country.code,
    countryName: city.country.name,
    latitude: city.coordinates.latitude,
    longitude: city.coordinates.longitude,
  };
}

export type { Country, City, CityCoordinates };
