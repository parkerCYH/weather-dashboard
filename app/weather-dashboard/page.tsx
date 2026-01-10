import CalloutCard from "@/components/CalloutCard";
import HumidityChart from "@/components/HumidityChart";
import InformationPanel from "@/components/InformationPanel";
import RainChart from "@/components/RainChart";
import StatCard from "@/components/StatCard";
import TempChart from "@/components/TempChart";
import { getCoordinates } from "@/lib/mockCoordinates";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

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

  // 支援兩種模式：1) country & city (原有模式) 2) lat & lon (搜尋模式)
  if (latParam && lonParam) {
    // 搜尋模式：直接使用 lat/lon
    lat = latParam;
    long = lonParam;
    cityName = city || "Selected Location";
  } else if (country && city) {
    // 原有模式：使用 country & city 查詢座標
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
    <div className="flex flex-col min-h-screen md:flex-row bg-gray-50">
      <InformationPanel
        city={cityName}
        lat={lat}
        long={long}
        results={results}
      />
      <div className="flex-1 p-5 lg:p-10">
        <div className="p-5">
          <div className="pb-5">
            <h2 className="text-xl font-bold">Todays Overview</h2>
            <p className="text-sm text-gray-400">
              Last Updated at:{" "}
              {new Date(results.current_weather.time).toLocaleString()}
            </p>
          </div>
          <div className="m-2 mb-10">
            <CalloutCard weatherData={results} />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 m-2">
            <StatCard
              title="Maximum Temperature"
              metric={`${results.daily.temperature_2m_max?.[0].toFixed(1)}`}
              color="yellow"
            />
            <StatCard
              title="Minimum Temperature"
              metric={`${results.daily.temperature_2m_min?.[0].toFixed(1)}`}
              color="green"
            />

            <div className="">
              <StatCard
                title="UV Index"
                metric={results.daily.uv_index_max?.[0].toFixed(1)}
                color="rose"
              />
            </div>
            <div className="flex space-x-3">
              <StatCard
                title="Wind Speed"
                metric={`${results.current_weather.windspeed.toFixed(1)}m/s`}
                color="cyan"
              />
              <StatCard
                title="Wind Direction"
                metric={`${results.current_weather.winddirection.toFixed(1)}°`}
                color="violet"
              />
            </div>
          </div>
        </div>
        <hr className="mb-5" />
        <ChartBlock results={results} />
      </div>
    </div>
  );
}

const ChartBlock = ({ results }: { results: Root }) => {
  return (
    <div className="space-y-3">
      <TempChart results={results} />
      <RainChart results={results} />
      <HumidityChart results={results} />
    </div>
  );
};

export default WeatherPage;
