import React from "react";
import CityPicker from "./CityPicker";

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
        <h1 className="text-6xl font-bold">{decodeURI(city)}</h1>
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
    </div>
  );
}

export default InformationPanel;
