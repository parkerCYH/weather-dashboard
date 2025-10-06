"use client";

import { CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Props = {
  message: string;
  warning?: boolean;
};

function CalloutCard({ message, warning }: Props) {
  const Icon = warning ? AlertCircle : CheckCircle;

  return (
    <Alert variant={warning ? "destructive" : "default"} className="mt-4">
      <Icon className="h-4 w-4" />
      <AlertTitle>{warning ? "Warning" : "Info"}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export default CalloutCard;
