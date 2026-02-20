"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useDebounce from "@/lib/hooks/useDebounce";
import { useNominatimSearch, usePlaceSearch } from "@/lib/hooks/usePlaces";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import PlaceSearchItem from "./PlaceSearchItem";

export default function SearchInput() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 700);

  const { data: dbData, isLoading: isSearchingDB } = usePlaceSearch(debouncedQuery);
  const {
    data: nominatimData,
    refetch: fetchNominatim,
    isFetching: isFetchingMore,
  } = useNominatimSearch(debouncedQuery);

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
        <Card className="border-0 shadow-none">
          <CardContent className="p-0 overflow-hidden relative border rounded-xl">
            <div className="max-h-64 overflow-y-auto">
              {allResults.map((place, index) => (
                <PlaceSearchItem
                  key={`${place.osmType}-${place.osmId}-${index}`}
                  place={place}
                  isFirst={index === 0}
                  isLast={index === allResults.length - 1}
                />
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
