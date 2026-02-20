"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useDebounce from "@/lib/hooks/useDebounce";
import { useNominatimSearch, usePlaceSearch, useSavePlace } from "@/lib/hooks/usePlaces";
import { useWeatherParams } from "@/lib/hooks/useWeatherParams";
import { PlaceResult } from "@/lib/types/place";
import { Loader2, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchInput() {
  const router = useRouter();
  const [{ mode }] = useWeatherParams();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 700);

  const { data: dbData, isLoading: isSearchingDB } = usePlaceSearch(debouncedQuery);
  const {
    data: nominatimData,
    refetch: fetchNominatim,
    isFetching: isFetchingMore,
  } = useNominatimSearch(debouncedQuery);
  const savePlaceMutation = useSavePlace();

  const dbResults = dbData?.results || [];
  const nominatimResults = nominatimData?.results || [];
  const showNominatimButton =
    debouncedQuery.trim().length >= 2 &&
    !isSearchingDB &&
    dbResults.length === 0 &&
    nominatimResults.length === 0;


  const handleFetchMore = () => {
    fetchNominatim();
  };


  const handleSelectPlace = async (place: PlaceResult) => {

    if (place.source === "Nominatim") {
      try {
        await savePlaceMutation.mutateAsync(place);
      } catch (error) {
        console.error("Error saving place:", error);

      }
    }

    router.push(
      `/weather-dashboard?lat=${place.lat}&lon=${place.lon}&city=${encodeURIComponent(
        place.name
      )}&mode=${mode}`
    );
  };

  const allResults = [...dbResults, ...nominatimResults];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search a place..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isSearchingDB && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {allResults.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="max-h-64 overflow-y-auto">
              {allResults.map((place, index) => (
                <button
                  key={`${place.osmType}-${place.osmId}-${index}`}
                  onClick={() => handleSelectPlace(place)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {place.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {place.type} • {place.source}
                      </p>
                      <p className="text-xs text-gray-400">
                        {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showNominatimButton && (
        <Button
          onClick={handleFetchMore}
          disabled={isFetchingMore}
          variant="outline"
          className="w-full"
        >
          {isFetchingMore ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Load more results
            </>
          )}
        </Button>
      )}

      {!isSearchingDB &&
        debouncedQuery.trim().length >= 2 &&
        allResults.length === 0 &&
        !showNominatimButton && (
          <p className="text-center text-sm text-gray-500 py-4">
            No results found
          </p>
        )}
    </div>
  );
}
