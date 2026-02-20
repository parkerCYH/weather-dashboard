import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CalloutCard from "@/app/weather-dashboard/_cards/CalloutCard";

type Props = {
    weatherData: Root;
};

export const TodayOverviewCard = ({ weatherData }: Props) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Today's Overview</CardTitle>
                <CardDescription className="text-gray-500">
                    Last Updated at {new Date(weatherData.current_weather.time).toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <CalloutCard weatherData={weatherData} />
            </CardContent>
        </Card>
    );
};
