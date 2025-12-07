"use client";

import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

  const Icon = loading ? Loader2 : warning ? AlertCircle : CheckCircle;

  return (
    <Alert variant={warning ? "destructive" : "default"} className="mt-4">
      <Icon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      <AlertTitle>
        {loading ? "Loading..." : warning ? "Warning" : "Info"}
      </AlertTitle>
      <AlertDescription>
        {loading ? "Generating weather suggestion..." : message}
      </AlertDescription>
    </Alert>
  );
}

export default CalloutCard;
