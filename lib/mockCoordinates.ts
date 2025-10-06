// Mock coordinates for testing
// In production, this will be replaced with an API call

type CityCoordinates = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};

const mockCityCoordinates: CityCoordinates[] = [
  {
    city: "Beijing",
    country: "China",
    latitude: 39.9042,
    longitude: 116.4074,
  },
  {
    city: "New York",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    city: "London",
    country: "United Kingdom",
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    city: "Paris",
    country: "France",
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    city: "Moscow",
    country: "Russia",
    latitude: 55.7558,
    longitude: 37.6173,
  },
];

/**
 * Get coordinates for a city
 * TODO: Replace this with actual API call
 * @param cityName - The name of the city
 * @returns Coordinates object or undefined if not found
 */
export function getMockCoordinates(
  cityName: string
): CityCoordinates | undefined {
  return mockCityCoordinates.find(
    (city) => city.city.toLowerCase() === cityName.toLowerCase()
  );
}

/**
 * Get all available mock cities
 */
export function getAllMockCities(): CityCoordinates[] {
  return mockCityCoordinates;
}

export type { CityCoordinates };
