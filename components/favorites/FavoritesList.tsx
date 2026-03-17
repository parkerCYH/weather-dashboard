"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useFavoritesStore } from "@/lib/stores/favoritesStore";

interface FavoritesListProps {
    isLoggedIn: boolean;
}

export default function FavoritesList({ isLoggedIn }: FavoritesListProps) {
    const { favorites, isLoading } = useFavorites();
    const clearStore = useFavoritesStore((s) => s.clear);

    // Clear localStorage favorites when the user logs in
    useEffect(() => {
        if (isLoggedIn) {
            clearStore();
        }
    }, [isLoggedIn, clearStore]);

    if (isLoading) return null;

    return (
        <Card className="w-full max-w-4xl mt-6 mb-10">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="size-5 text-yellow-400" fill="currentColor" />
                    My Favourites
                </CardTitle>
            </CardHeader>
            <CardContent>
                {favorites.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        你還沒有收藏的地點，快去搜尋吧！
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {favorites.map((place) => (
                            <li key={`${place.osmType}:${place.osmId}`}>
                                <Link
                                    href={`/weather-dashboard?lat=${place.lat}&lon=${place.lon}&city=${encodeURIComponent(place.name)}`}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                                >
                                    <MapPin className="size-4 text-blue-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate group-hover:text-blue-600">
                                            {place.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
