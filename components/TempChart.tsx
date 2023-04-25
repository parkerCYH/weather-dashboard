"use client";

import { AreaChart, Card, Title } from "@tremor/react";
import moment from "moment";

type Props = { results: Root };

function TempChart({ results }: Props) {
  const hourly = results?.hourly.time
    .map((t) => moment.unix(t).format("HH"))
    .slice(0, 24); // 1 week has 168 hour, but we only need current day.

  const data = hourly.map((hour, i) => {
    return {
      time: Number(hour),
      "UV Index": results.hourly.uv_index[i],
      "Temperature (°C)": results.hourly.temperature_2m[i],
    };
  });

  const dataFormatter = (number: number) => `${number} °C`;
  return (
    <Card>
      <Title>Temperature & UV Index</Title>
      <AreaChart
        className="mt-6"
        data={data}
        showLegend
        index="time"
        categories={["Temperature (°C)", "UV Index"]}
        colors={["yellow", "rose"]}
        minValue={0}
        valueFormatter={dataFormatter}
      />
    </Card>
  );
}

export default TempChart;
