"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/apiClient";
import { PlaceResult } from "@/lib/types/place";
import { useFavoritesStore, GUEST_LIMIT } from "@/lib/stores/favoritesStore";

interface FavoritesResponse {
    favorites: PlaceResult[];
}

export const favoriteKeys = {
    all: ["favorites"] as const,
};

// ─── Logged-in: React Query ─────────────────────────────────────────────────

function useServerFavorites() {
    return useQuery({
        queryKey: favoriteKeys.all,
        queryFn: () =>
            apiClient.get<FavoritesResponse>("/api/favorites", { requireAuth: false }),
        staleTime: 5 * 60 * 1000,
    });
}

// ─── Unified hooks ──────────────────────────────────────────────────────────

/**
 * Returns the favorites list.
 * - Logged-in: fetched from Redis via API
 * - Guest: read from Zustand/localStorage
 */
export function useFavorites(): { favorites: PlaceResult[]; isLoading: boolean } {
    const { data: session, status } = useSession();
    const isLoggedIn = !!session?.user;

    const storeList = useFavoritesStore((s) => s.favorites);
    const serverQuery = useServerFavorites();

    if (isLoggedIn) {
        return {
            favorites: serverQuery.data?.favorites ?? [],
            isLoading: status === "loading" || serverQuery.isLoading,
        };
    }

    return { favorites: storeList, isLoading: status === "loading" };
}

/**
 * Returns true if the given place is in the user's favorites.
 */
export function useIsFavorite(place: Pick<PlaceResult, "osmType" | "osmId">): boolean {
    const { data: session } = useSession();
    const isLoggedIn = !!session?.user;

    const storeIsFav = useFavoritesStore((s) => s.isFavorite);
    const { favorites: serverFavs } = useFavorites();

    if (isLoggedIn) {
        return serverFavs.some(
            (f) => f.osmType === place.osmType && String(f.osmId) === String(place.osmId)
        );
    }

    return storeIsFav(place.osmType, String(place.osmId));
}

/**
 * Returns whether the user has reached their favorites limit.
 * - Guest: 3
 * - Logged-in: 10
 */
export function useIsAtFavoritesLimit(): boolean {
    const { data: session } = useSession();
    const isLoggedIn = !!session?.user;
    const storeCount = useFavoritesStore((s) => s.favorites.length);
    const { favorites: serverFavs } = useFavorites();

    if (isLoggedIn) return serverFavs.length >= 10;
    return storeCount >= GUEST_LIMIT;
}

/**
 * Adds a place to favorites.
 */
export function useAddFavorite() {
    const { data: session } = useSession();
    const isLoggedIn = !!session?.user;
    const queryClient = useQueryClient();
    const storeAdd = useFavoritesStore((s) => s.addFavorite);

    const serverMutation = useMutation({
        mutationFn: (place: PlaceResult) =>
            apiClient.post<{ message: string; place: PlaceResult }>(
                "/api/favorites",
                place,
                { requireAuth: false }
            ),
        onMutate: async (place) => {
            await queryClient.cancelQueries({ queryKey: favoriteKeys.all });
            const prev = queryClient.getQueryData<FavoritesResponse>(favoriteKeys.all);
            queryClient.setQueryData<FavoritesResponse>(favoriteKeys.all, (old) => ({
                favorites: [...(old?.favorites ?? []), place],
            }));
            return { prev };
        },
        onError: (_err, _place, ctx) => {
            if (ctx?.prev) {
                queryClient.setQueryData(favoriteKeys.all, ctx.prev);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
        },
    });

    return {
        addFavorite: (place: PlaceResult) => {
            if (isLoggedIn) {
                serverMutation.mutate(place);
            } else {
                storeAdd(place);
            }
        },
        isPending: serverMutation.isPending,
    };
}

/**
 * Removes a place from favorites.
 */
export function useRemoveFavorite() {
    const { data: session } = useSession();
    const isLoggedIn = !!session?.user;
    const queryClient = useQueryClient();
    const storeRemove = useFavoritesStore((s) => s.removeFavorite);

    const serverMutation = useMutation({
        mutationFn: ({ osmType, osmId }: { osmType: string; osmId: string }) =>
            apiClient.delete<{ message: string }>(
                "/api/favorites",
                {
                    requireAuth: false,
                    body: JSON.stringify({ osmType, osmId }),
                    headers: { "Content-Type": "application/json" },
                }
            ),
        onMutate: async ({ osmType, osmId }) => {
            await queryClient.cancelQueries({ queryKey: favoriteKeys.all });
            const prev = queryClient.getQueryData<FavoritesResponse>(favoriteKeys.all);
            queryClient.setQueryData<FavoritesResponse>(favoriteKeys.all, (old) => ({
                favorites: (old?.favorites ?? []).filter(
                    (f) => !(f.osmType === osmType && String(f.osmId) === String(osmId))
                ),
            }));
            return { prev };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) {
                queryClient.setQueryData(favoriteKeys.all, ctx.prev);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
        },
    });

    return {
        removeFavorite: (osmType: string, osmId: string) => {
            if (isLoggedIn) {
                serverMutation.mutate({ osmType, osmId });
            } else {
                storeRemove(osmType, osmId);
            }
        },
        isPending: serverMutation.isPending,
    };
}
