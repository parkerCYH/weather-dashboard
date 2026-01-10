"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { PlaceResult } from "../types/place";

// Query Keys
export const placeKeys = {
    all: ["places"] as const,
    search: (query: string) => [...placeKeys.all, "search", query] as const,
    nominatim: (query: string) => [...placeKeys.all, "nominatim", query] as const,
};

// API Response Types
interface SearchResponse {
    source: "database" | "nominatim";
    results: PlaceResult[];
}

// Hook: 搜尋資料庫中的地點
export function usePlaceSearch(query: string, enabled: boolean = true) {
    return useQuery({
        queryKey: placeKeys.search(query),
        queryFn: async () => {
            if (!query || query.trim().length < 2) {
                return { source: "database" as const, results: [] };
            }
            return apiClient.get<SearchResponse>(
                `/api/places/search?q=${encodeURIComponent(query)}`,
                { requireAuth: false }
            );
        },
        enabled: enabled && query.trim().length >= 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Hook: 從 Nominatim API 搜尋地點
export function useNominatimSearch(query: string) {
    return useQuery({
        queryKey: placeKeys.nominatim(query),
        queryFn: async () => {
            return apiClient.get<SearchResponse>(
                `/api/places/nominatim?q=${encodeURIComponent(query)}`,
                { requireAuth: false }
            );
        },
        enabled: false, // 手動觸發
        staleTime: 5 * 60 * 1000,
    });
}

// Hook: 儲存地點到資料庫
export function useSavePlace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (place: PlaceResult) => {
            return apiClient.post<{ message: string; place: PlaceResult }>(
                "/api/places",
                place,
                { requireAuth: false }
            );
        },
        onSuccess: () => {
            // 清除所有搜尋快取，讓下次搜尋能獲取最新資料
            queryClient.invalidateQueries({ queryKey: placeKeys.all });
        },
    });
}
