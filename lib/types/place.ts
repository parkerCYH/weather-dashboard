export interface PlaceResult {
  id?: string;
  osmType: string;
  osmId: string;
  name: string;
  class: string;
  type: string;
  lat: number;
  lon: number;
  source: string;
}

export interface SearchResponse {
  source: "database" | "nominatim";
  results: PlaceResult[];
}
