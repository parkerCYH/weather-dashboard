"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import LocationForm from "./location-form/LocationForm";
import SearchInput from "./SearchInput";
import { List, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SearchMode = "dropdown" | "search";

export default function LocationSearchToggle() {
  const [mode, setMode] = useState<SearchMode>("dropdown");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 w-full">
        <Button
          onClick={() => setMode("dropdown")}
          variant={mode === "dropdown" ? "default" : "outline"}
          className={cn("flex-1 transition-all", mode === "dropdown" && "bg-gray-100 text-gray-500", mode === "search" && "hover: cursor-pointer")}
          size="sm"
        >
          <List className="mr-2 h-4 w-4" />
          Dropdown
        </Button>
        <Button
          onClick={() => setMode("search")}
          variant={mode === "search" ? "default" : "outline"}
          className={cn("flex-1 transition-all", mode === "search" && "bg-gray-100 text-gray-500", mode === "dropdown" && "hover: cursor-pointer")}
          size="sm"
        >
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
