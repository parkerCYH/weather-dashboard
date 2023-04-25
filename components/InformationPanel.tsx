import React from "react";
import CityPicker from "./CityPicker";
import Image from "next/image";
import weatherCodeToString from "@/lib/weatherCodeToString";
import { MoonIcon, SunIcon } from "@heroicons/react/solid";
import moment from "moment";
import Link from "next/link";

type Props = {
  city: string;
  results: Root;
  lat: string;
  long: string;
};

function InformationPanel({ city, lat, long, results }: Props) {
  return (
    <div className="bg-gradient-to-br from-[#bd5656] to-[#e47070] p-10  text-white">
      <div className="pb-5">
        <h1 className="text-6xl font-bold">
          <Link href="/">{decodeURI(city)}</Link>
        </h1>
        <p className="text-xs text-gray-400">
          Long/Lat: {long}, {lat}
        </p>
      </div>
      <CityPicker />
      <hr className="my-10" />
      <div className="mt-5 flex items-center justify-between space-x-10 mb-5">
        <div>
          <p className="text-xl">
            {new Date().toLocaleDateString("zh-TW", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className=" font-extralight">
            TimeZone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>
        <p className="text-xl font-bold uppercase">
          {new Date().toLocaleTimeString("zh-TW", {
            hour: "numeric",
            minute: "numeric",
            hour12: false,
          })}
        </p>
      </div>
      <hr className="mt-10 mb-5" />
      <div className=" flex justify-between items-center">
        <div>
          <Image
            src={`https://www.weatherbit.io/static/img/icons/${
              weatherCodeToString[results.current_weather.weathercode].icon
            }.png`}
            alt={weatherCodeToString[results.current_weather.weathercode].label}
            width={75}
            height={75}
          />
          <div className="flex justify-between items-center space-x-10">
            <p className="text-6xl font-semibold">
              {results.current_weather.temperature.toFixed(1)}°C
            </p>
            <p className=" text-right font-extralight text-lg">
              {weatherCodeToString[results.current_weather.weathercode].label}
            </p>
          </div>
        </div>
      </div>
      <div className=" space-y-2 py-5">
        <SunItem time={results.daily.sunrise?.[0]} />
        <SunsetItem time={results.daily.sunset?.[0]} />
      </div>
    </div>
  );
}

const SunItem = ({ time }: { time: number }) => (
  <div className="flex items-center space-x-2 px-4 py-3 border border-[#6F90CD] rounded-md bg-[#405885]">
    <SunIcon className="h-10 w-10 text-gray-400" />
    <div className="flex-1 flex justify-between items-center">
      <p className="font-extralight">Sunrise</p>
      <p className="uppercase text-2xl">{moment.unix(time).format("HH:mm")}</p>
    </div>
  </div>
);

const SunsetItem = ({ time }: { time: number }) => (
  <div className="flex items-center space-x-2 px-4 py-3 border border-[#6F90CD] rounded-md bg-[#405885]">
    <MoonIcon className="h-10 w-10 text-gray-400" />
    <div className="flex-1 flex justify-between items-center">
      <p className="font-extralight">Sunset</p>
      <p className="uppercase text-2xl">{moment.unix(time).format("HH:mm")}</p>
    </div>
  </div>
);
export default InformationPanel;
