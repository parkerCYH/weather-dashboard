"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import LocationForm from "./location-form/LocationForm";
import SearchInput from "./SearchInput";
import { List, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SearchMode = "dropdown" | "search";

export default function LocationSearchToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<SearchMode>(() => {
    const modeParam = searchParams.get("mode");
    return (modeParam === "search" || modeParam === "dropdown") ? modeParam : "dropdown";
  });

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", newMode);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 w-full">
        <Button
          onClick={() => handleModeChange("dropdown")}
          variant={mode === "dropdown" ? "default" : "outline"}
          className={cn("flex-1 transition-all", mode === "dropdown" && "bg-gray-100 text-gray-500", mode === "search" && "hover: cursor-pointer")}
          size="sm">
          <List className="mr-2 h-4 w-4" />
          Dropdown
        </Button>
        <Button
          onClick={() => handleModeChange("search")}
          variant={mode === "search" ? "default" : "outline"}
          className={cn("flex-1 transition-all", mode === "search" && "bg-gray-100 text-gray-500", mode === "dropdown" && "hover: cursor-pointer")}
          size="sm">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      <Card className="bg-white/95 backdrop-blur-sm shadow-sm ">
        <CardContent className="pt-6 pb-4">
          {mode === "dropdown" ? <LocationForm /> : <SearchInput />}
        </CardContent>
      </Card>
    </div>
  );
}
