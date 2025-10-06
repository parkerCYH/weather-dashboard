// Mock data for three API concepts
// In production, these will be replaced with actual API calls

type Country = {
  code: string;
  name: string;
};

type City = {
  code: string;
  name: string;
  countryCode: string;
};

type CityCoordinates = {
  cityCode: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
};

// Mock countries data
const mockCountries: Country[] = [
  { code: "CN", name: "China" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "RU", name: "Russia" },
];

// Mock cities data
const mockCities: City[] = [
  { code: "BJ", name: "Beijing", countryCode: "CN" },
  { code: "SH", name: "Shanghai", countryCode: "CN" },
  { code: "NYC", name: "New York", countryCode: "US" },
  { code: "LA", name: "Los Angeles", countryCode: "US" },
  { code: "LON", name: "London", countryCode: "GB" },
  { code: "MAN", name: "Manchester", countryCode: "GB" },
  { code: "PAR", name: "Paris", countryCode: "FR" },
  { code: "LYO", name: "Lyon", countryCode: "FR" },
  { code: "MOW", name: "Moscow", countryCode: "RU" },
  { code: "SPB", name: "St. Petersburg", countryCode: "RU" },
];

// Mock coordinates data
const mockCoordinates: CityCoordinates[] = [
  {
    cityCode: "BJ",
    cityName: "Beijing",
    countryCode: "CN",
    countryName: "China",
    latitude: 39.9042,
    longitude: 116.4074,
  },
  {
    cityCode: "SH",
    cityName: "Shanghai",
    countryCode: "CN",
    countryName: "China",
    latitude: 31.2304,
    longitude: 121.4737,
  },
  {
    cityCode: "NYC",
    cityName: "New York",
    countryCode: "US",
    countryName: "United States",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    cityCode: "LA",
    cityName: "Los Angeles",
    countryCode: "US",
    countryName: "United States",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    cityCode: "LON",
    cityName: "London",
    countryCode: "GB",
    countryName: "United Kingdom",
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    cityCode: "MAN",
    cityName: "Manchester",
    countryCode: "GB",
    countryName: "United Kingdom",
    latitude: 53.4808,
    longitude: -2.2426,
  },
  {
    cityCode: "PAR",
    cityName: "Paris",
    countryCode: "FR",
    countryName: "France",
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    cityCode: "LYO",
    cityName: "Lyon",
    countryCode: "FR",
    countryName: "France",
    latitude: 45.764,
    longitude: 4.8357,
  },
  {
    cityCode: "MOW",
    cityName: "Moscow",
    countryCode: "RU",
    countryName: "Russia",
    latitude: 55.7558,
    longitude: 37.6173,
  },
  {
    cityCode: "SPB",
    cityName: "St. Petersburg",
    countryCode: "RU",
    countryName: "Russia",
    latitude: 59.9311,
    longitude: 30.3609,
  },
];

/**
 * API 1: Get all countries
 * @returns Array of all available countries
 */
export function getAllCountries(): Country[] {
  return mockCountries;
}

/**
 * API 2: Get all cities by country code
 * @param countryCode - The country code (e.g., "CN", "US")
 * @returns Array of cities in the specified country
 */
export function getCitiesByCountry(countryCode: string): City[] {
  return mockCities.filter(
    (city) => city.countryCode.toLowerCase() === countryCode.toLowerCase()
  );
}

/**
 * API 3: Get coordinates by country and city code
 * @param countryCode - The country code (e.g., "CN", "US")
 * @param cityCode - The city code (e.g., "BJ", "NYC")
 * @returns Coordinates object or undefined if not found
 */
export function getCoordinates(
  countryCode: string,
  cityCode: string
): CityCoordinates | undefined {
  return mockCoordinates.find(
    (coord) =>
      coord.countryCode.toLowerCase() === countryCode.toLowerCase() &&
      coord.cityCode.toLowerCase() === cityCode.toLowerCase()
  );
}

// Legacy functions for backward compatibility
/**
 * Get coordinates for a city (legacy function)
 * @param cityName - The name of the city
 * @returns Coordinates object or undefined if not found
 */
export function getMockCoordinates(
  cityName: string
): CityCoordinates | undefined {
  return mockCoordinates.find(
    (coord) => coord.cityName.toLowerCase() === cityName.toLowerCase()
  );
}

/**
 * Get all available mock cities (legacy function)
 */
export function getAllMockCities(): CityCoordinates[] {
  return mockCoordinates;
}

export type { Country, City, CityCoordinates };
