"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PlaceResult } from "@/lib/types/place";

const GUEST_LIMIT = 3;
const STORAGE_KEY = "weather-guest-favorites";

interface FavoritesState {
    favorites: PlaceResult[];
    addFavorite: (place: PlaceResult) => void;
    removeFavorite: (osmType: string, osmId: string) => void;
    isFavorite: (osmType: string, osmId: string) => boolean;
    clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favorites: [],

            addFavorite: (place: PlaceResult) => {
                const { favorites } = get();
                if (favorites.length >= GUEST_LIMIT) return;
                const key = `${place.osmType}:${place.osmId}`;
                const exists = favorites.some(
                    (f) => `${f.osmType}:${f.osmId}` === key
                );
                if (exists) return;
                set({ favorites: [...favorites, place] });
            },

            removeFavorite: (osmType: string, osmId: string) => {
                set((state) => ({
                    favorites: state.favorites.filter(
                        (f) => !(f.osmType === osmType && String(f.osmId) === String(osmId))
                    ),
                }));
            },

            isFavorite: (osmType: string, osmId: string) => {
                return get().favorites.some(
                    (f) => f.osmType === osmType && String(f.osmId) === String(osmId)
                );
            },

            clear: () => set({ favorites: [] }),
        }),
        {
            name: STORAGE_KEY,
        }
    )
);

export { GUEST_LIMIT };
