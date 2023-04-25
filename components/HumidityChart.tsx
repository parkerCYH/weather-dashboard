"use client";

import { AreaChart, Card, Title } from "@tremor/react";
import moment from "moment";

type Props = { results: Root };

function HumidityChart({ results }: Props) {
  const hourly = results?.hourly.time
    .map((t) => moment.unix(t).format("HH"))
    .slice(0, 24); // 1 week has 168 hour, but we only need current day.

  const data = hourly.map((hour, i) => {
    return {
      time: Number(hour),
      "Humidity (%)": results.hourly.relativehumidity_2m?.[i],
    };
  });

  const dataFormatter = (number: number) => `${number} %`;
  return (
    <Card>
      <Title>Humidity Level</Title>
      <AreaChart
        className="mt-6"
        data={data}
        showLegend
        index="time"
        categories={["Humidity (%)"]}
        colors={["teal"]}
        minValue={0}
        maxValue={100}
        valueFormatter={dataFormatter}
        yAxisWidth={40}
      />
    </Card>
  );
}

export default HumidityChart;
