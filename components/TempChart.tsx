"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature & UV Index</CardTitle>
        <CardDescription>24-hour forecast</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorUV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Temperature (°C)"
              stroke="#eab308"
              fillOpacity={1}
              fill="url(#colorTemp)"
            />
            <Area
              type="monotone"
              dataKey="UV Index"
              stroke="#f43f5e"
              fillOpacity={1}
              fill="url(#colorUV)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default TempChart;
