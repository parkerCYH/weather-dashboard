"use client";

import { PlaceResult } from "@/lib/types/place";
import { Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWeatherParams } from "@/lib/hooks/useWeatherParams";
import { useSavePlace } from "@/lib/hooks/usePlaces";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlaceSearchItemProps {
    place: PlaceResult;
    isFirst: boolean;
    isLast: boolean;
}

export default function PlaceSearchItem({
    place,
    isFirst,
    isLast,
}: PlaceSearchItemProps) {
    const router = useRouter();
    const [{ mode }] = useWeatherParams();
    const savePlaceMutation = useSavePlace();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        try {
            if (place.source === "Nominatim") {
                await savePlaceMutation.mutateAsync(place);
            }

            await router.push(
                `/weather-dashboard?lat=${place.lat}&lon=${place.lon}&city=${encodeURIComponent(
                    place.name
                )}&mode=${mode}`
            );
            setIsLoading(false);
        } catch (error) {
            console.error("Error selecting place:", error);
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`w-full text-left px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 transition-colors relative ${isFirst ? "rounded-t-xl" : ""
                } ${isLast ? "rounded-b-xl" : ""} ${isLoading ? "opacity-50" : ""
                }`}
        >
            <div className="flex items-start gap-2">
                {isLoading ? (
                    <Loader2 className="h-4 mt-1 w-4 animate-spin text-gray-400 shrink-0" />
                ) :
                    <MapPin className="h-4 w-4 mt-1 text-gray-400 shrink-0" />}
                <div className="flex-1 min-w-0">
                    <TooltipProvider>
                        <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                                <p className="font-medium text-sm truncate">{place.name}</p>
                            </TooltipTrigger>
                            <TooltipContent
                                className="max-w-xs bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
                                <p>{place.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <p className="text-xs text-gray-500">
                        {place.type} • {place.source}
                    </p>
                    <p className="text-xs text-gray-400">
                        {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
                    </p>
                </div>

            </div>
        </button>
    );
}
