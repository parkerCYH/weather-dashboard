"use client";

import LocationSearchToggle from "@/components/form/LocationSearchToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bookmark, BookmarkCheck, MapPin } from "lucide-react";
import { useIsFavorite, useAddFavorite, useRemoveFavorite, useIsAtFavoritesLimit } from "@/lib/hooks/useFavorites";
import { PlaceResult } from "@/lib/types/place";

const PlaceCardInner = ({ city, lat, long }: { city: string; lat: string; long: string }) => {
    const place: PlaceResult = {
        osmType: "coord",
        osmId: `${lat}_${long}`,
        name: decodeURI(city),
        class: "place",
        type: "location",
        lat: parseFloat(lat),
        lon: parseFloat(long),
        source: "Dashboard",
    };

    const isFav = useIsFavorite(place);
    const isAtLimit = useIsAtFavoritesLimit();
    const { addFavorite } = useAddFavorite();
    const { removeFavorite } = useRemoveFavorite();

    const handleBookmark = () => {
        if (isFav) {
            removeFavorite(place.osmType, String(place.osmId));
        } else {
            addFavorite(place);
        }
    };

    const saveDisabled = !isFav && isAtLimit;

    return (
        <Card className="p-6">
            <div className="flex items-start gap-3">
                <MapPin className="size-6 text-blue-600 shrink-0 mt-1" />
                <div className="flex-1">
                    <TooltipProvider>
                        <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                                <h1 className="text-base font-bold cursor-help">
                                    {decodeURI(city)}
                                </h1>
                            </TooltipTrigger>
                            <TooltipContent
                                className="max-w-xs bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm"
                                sideOffset={8}
                            >
                                <p>{decodeURI(city)}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <p className="text-xs text-gray-600 mt-1">
                        Long={long}, {lat}
                    </p>
                </div>
                <TooltipProvider>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <span tabIndex={0}>
                                <Button
                                    onClick={handleBookmark}
                                    variant={isFav ? "default" : "outline"}
                                    size="sm"
                                    disabled={saveDisabled}
                                    className="gap-1.5"
                                    aria-label={isFav ? "Remove from saved locations" : "Save location"}
                                >
                                    {isFav
                                        ? <BookmarkCheck className="size-4" />
                                        : <Bookmark className="size-4" />
                                    }
                                    {isFav ? "Saved" : "Save"}
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {saveDisabled && (
                            <TooltipContent
                                className="max-w-xs bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm"
                                sideOffset={8}
                            >
                                <p>Favorites limit reached</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>
            <hr className="my-5" />
            <LocationSearchToggle />
        </Card>
    );
};

export const PlaceCard = ({ city, lat, long }: { city: string; lat: string; long: string; isGuest: boolean }) => {
    return <PlaceCardInner city={city} lat={lat} long={long} />;
};