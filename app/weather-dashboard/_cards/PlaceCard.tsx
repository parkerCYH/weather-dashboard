import LocationSearchToggle from "@/components/form/LocationSearchToggle";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin } from "lucide-react";


export const PlaceCard = ({ city, lat, long }: { city: string; lat: string; long: string }) => {

    return <Card className="p-6">
        <div className="flex items-start gap-3">
            <MapPin className="size-6 text-blue-600 shrink-0 mt-1" />
            <div className="flex-1">
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <h1 className="text-base font-bold cursor-help">
                                {decodeURI(city)}
                            </h1>
                        </TooltipTrigger>
                        <TooltipContent
                            side="bottom"
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
        </div>
        <hr className="my-5" />
        <LocationSearchToggle />
    </Card>
}