import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

type Props = {
  title: string;
  metric: string;
  color?: string;
};

const colorClasses: Record<string, string> = {
  yellow: "border-t-yellow-500",
  green: "border-t-green-500",
  rose: "border-t-rose-500",
  cyan: "border-t-cyan-500",
  violet: "border-t-violet-500",
  blue: "border-t-blue-500",
  teal: "border-t-teal-500",
};

function StatCard({ title, metric, color = "blue" }: Props) {
  return (
    <Card className={`border-t-4 ${colorClasses[color] || colorClasses.blue}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric}</div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
