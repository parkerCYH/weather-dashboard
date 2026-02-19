import CalloutCard from "@/components/CalloutCard";
import HumidityChart from "@/components/HumidityChart";
import RainChart from "@/components/RainChart";
import StatCard from "@/components/StatCard";
import TempChart from "@/components/TempChart";
import { TodayOverviewCard } from "./_card/TodayOverviewCard";
import { getCoordinates } from "@/lib/mockCoordinates";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { PlaceCard } from "./_card/PlaceCard";
import { WeatherCard } from "./_card/WeatherCard";

export const revalidate = 60;

type Props = {
  searchParams: Promise<{
    country?: string;
    city?: string;
    lat?: string;
    lon?: string;
  }>;
};

async function WeatherPage(props: Props) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login?error=unauthorized&message=Please sign in to view weather dashboard");
  }

  const searchParams = await props.searchParams;
  const { country, city, lat: latParam, lon: lonParam } = searchParams;

  let lat: string;
  let long: string;
  let cityName: string;


  if (latParam && lonParam) {

    lat = latParam;
    long = lonParam;
    cityName = city || "Selected Location";
  } else if (country && city) {

    const coordinates = getCoordinates(country, city);

    if (!coordinates) {
      redirect("/?error=invalid_location&message=Could not find coordinates for selected location");
    }

    lat = coordinates.latitude.toString();
    long = coordinates.longitude.toString();
    cityName = coordinates.cityName;
  } else {
    redirect("/?error=missing_location&message=Please select a location");
  }


  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/weather?latitude=${lat}&longitude=${long}`;
  const response = await fetch(apiUrl, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    console.error("Failed to fetch weather data");
    redirect("/?error=api_error&message=Failed to fetch weather data. Please try again later");
  }

  const results: Root = await response.json();

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <div className="p-5 lg:p-10 text-gray-900 w-full md:w-96 shrink-0 space-y-4">
        <PlaceCard city={cityName} lat={lat} long={long} />
        <WeatherCard results={results} />
      </div>
      <div className="flex-1 p-5 lg:p-10 space-y-4">
        <TodayOverviewCard weatherData={results} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            title="Maximum Temperature"
            metric={`${results.daily.temperature_2m_max?.[0].toFixed(1)}`}

          />
          <StatCard
            title="Minimum Temperature"
            metric={`${results.daily.temperature_2m_min?.[0].toFixed(1)}`}

          />


          <StatCard
            title="UV Index"
            metric={results.daily.uv_index_max?.[0].toFixed(1)}
            {...(results.daily.uv_index_max?.[0] > 7 ? { color: "rose" as const } : {})}
          />


          <StatCard
            title="Wind Speed"
            metric={`${results.current_weather.windspeed.toFixed(1)}m/s`}

          />
          <StatCard
            title="Wind Direction"
            metric={`${results.current_weather.winddirection.toFixed(1)}°`}

          />

        </div>

        <ChartBlock results={results} />
      </div>
    </div>
  );
}

const ChartBlock = ({ results }: { results: Root }) => {
  return (
    <div className="space-y-4">
      <TempChart results={results} />
      <RainChart results={results} />
      <HumidityChart results={results} />
    </div>
  );
};

export default WeatherPage;
