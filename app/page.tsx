"use client";

import LocationForm from "@/components/form/location-form/LocationForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#bd5656] to-[#e47070] p-10 flex flex-col justify-center items-center">
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
          <Card className="bg-gradient-to-br from-[#bd5656] to-[#e47070]">
            <CardContent className="pt-6">
              <LocationForm />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </main>
  );
}
