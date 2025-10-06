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

function RainChart({ results }: Props) {
  const hourly = results?.hourly.time
    .map((t) => moment.unix(t).format("HH"))
    .slice(0, 24); // 1 week has 168 hour, but we only need current day.

  const data = hourly.map((hour, i) => {
    return {
      time: Number(hour),
      "Rain (%)": results.hourly.precipitation_probability?.[i],
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chances of Rain</CardTitle>
        <CardDescription>Precipitation probability</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
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
              dataKey="Rain (%)"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorRain)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default RainChart;
