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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Humidity Level</CardTitle>
        <CardDescription>Relative humidity percentage</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              domain={[0, 100]}
              width={40}
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              formatter={(value: number) => `${value}%`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Humidity (%)"
              stroke="#14b8a6"
              fillOpacity={1}
              fill="url(#colorHumidity)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default HumidityChart;
