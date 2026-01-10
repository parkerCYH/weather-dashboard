import LocationSearchToggle from "@/components/form/LocationSearchToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getServerAuthSession } from "@/lib/getServerAuthSession";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";

type Props = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function Home(props: Props) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login");
  }
  const searchParams = await props.searchParams;
  const { error, message } = searchParams;
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-10 flex flex-col justify-center items-center">
      <Card className="w-full max-w-4xl">
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
          {error && message && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <LocationSearchToggle />
        </CardContent>
      </Card>
    </main>
  );
}
