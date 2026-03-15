import LocationSearchToggle from "@/components/form/LocationSearchToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { AlertCircle } from "lucide-react";

type Props = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function Home(props: Props) {
  const session = await getServerAuthSession();
  const searchParams = await props.searchParams;
  const { error, message } = searchParams;
  return (
    <main className="min-h-[calc(100vh-var(--header-height))]  p-10 flex flex-col justify-center items-center">
      <Card className="w-full max-w-4xl mt-16">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold mb-4">
            Weather Dashboard
          </CardTitle>
          <CardDescription className="text-xl">
            powered by Next.js, Tailwind CSS, shadcn/ui, Recharts +more!
          </CardDescription>
        </CardHeader>
        <Separator className="my-6" />
        <CardContent>
          {!session && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are browsing as a guest.{" "}
                <a href="/login" className="font-semibold underline underline-offset-2">
                  Sign in
                </a>{" "}
                to save your favourite locations.
              </AlertDescription>
            </Alert>
          )}
          {error && message && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <LocationSearchToggle />
        </CardContent>
      </Card>
    </main>
  );
}
