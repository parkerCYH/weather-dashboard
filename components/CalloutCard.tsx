"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  weatherData: Root;
};

function CalloutCard({ weatherData }: Props) {
  const [message, setMessage] = useState<string>("");
  const [warning, setWarning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/suggestion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(weatherData),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch suggestion");
        }

        const data = await response.json();
        setMessage(data.suggestion);
        setWarning(data.warning);
      } catch (error) {
        console.error("Error fetching suggestion:", error);
        setMessage("Unable to load weather suggestion at this time.");
        setWarning(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestion();
  }, [weatherData]);

  const bgColor = warning ? "bg-yellow-50" : "bg-blue-50";
  const borderColor = warning ? "border-yellow-200" : "border-blue-200";
  const iconBgColor = warning ? "bg-yellow-600" : "bg-blue-600";
  const textColor = warning ? "text-yellow-900" : "text-blue-900";

  return (
    <div className={`flex gap-2 p-3 border rounded-lg ${bgColor} ${borderColor}`}>
      <div className={`size-5 rounded-full text-white flex items-center justify-center shrink-0 mt-0.5 ${iconBgColor}`}>
        {loading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <span className="text-xs">i</span>
        )}
      </div>
      <p className={`text-sm ${textColor}`}>
        {loading ? "Generating weather suggestion..." : message}
      </p>
    </div>
  );
}

export default CalloutCard;
