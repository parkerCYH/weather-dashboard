import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Moon, Sun } from "lucide-react";
import moment from "moment";
import weatherCodeToString from "@/lib/weatherCodeToString";

type Props = {
    results: Root;
};

export const WeatherCard = ({ results }: Props) => {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Date and Time */}
                    <div className="space-y-1 text-gray-500">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="size-4" />
                            <span>
                                {new Date().toLocaleDateString(undefined, {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="size-4" />
                            <span>
                                {new Date().toLocaleTimeString(undefined, {
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: false,
                                })}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            TimeZone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </p>
                    </div>

                    <Separator />

                    {/* Current Temperature */}
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl tracking-tight">
                                {results.current_weather.temperature.toFixed(1)}°C
                            </span>
                            <Badge variant="secondary">
                                {weatherCodeToString[results.current_weather.weathercode].label}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 text-gray-500">
                            Feels-like:{results.daily.apparent_temperature_max?.[0]?.toFixed(0)}°C
                        </p>
                    </div>

                    <Separator />

                    {/* Sun Times */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <Sun className="size-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground text-gray-500">Sunrise</p>
                                <p className="text-sm">
                                    {moment.unix(results.daily.sunrise?.[0]).format("HH:mm")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Moon className="size-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground text-gray-500">Sunset</p>
                                <p className="text-sm">
                                    {moment.unix(results.daily.sunset?.[0]).format("HH:mm")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
