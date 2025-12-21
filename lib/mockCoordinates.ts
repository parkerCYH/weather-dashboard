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
 
export function getMockCoordinates(
  cityName: string
): CityCoordinates | undefined {
  return mockCoordinates.find(
    (coord) => coord.cityName.toLowerCase() === cityName.toLowerCase()
  );
}
 
export function getAllMockCities(): CityCoordinates[] {
  return mockCoordinates;
}

export type { Country, City, CityCoordinates };
