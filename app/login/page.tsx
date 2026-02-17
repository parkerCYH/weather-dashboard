import { AuthShowcase } from "@/components/AuthShowcase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type Props = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams;
  const { error, message } = searchParams;

  return (
    <main className="flex flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-16 py-16 pt-40">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-[2rem]">
          Log in to Dashboard

        </h1>
        {error && message && (
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <AuthShowcase />
      </div>
    </main>
  );
}
