"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import LocationForm from "./location-form/LocationForm";
import SearchInput from "./SearchInput";
import { List, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type SearchMode = "dropdown" | "search";

export default function LocationSearchToggle() {
  const [mode, setMode] = useState<SearchMode>("dropdown");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 w-full">
        <Button
          onClick={() => setMode("dropdown")}
          variant={mode === "dropdown" ? "default" : "outline"}
          className="flex-1 transition-all"
          size="sm"
        >
          <List className="mr-2 h-4 w-4" />
          下拉選單
        </Button>
        <Button
          onClick={() => setMode("search")}
          variant={mode === "search" ? "default" : "outline"}
          className="flex-1 transition-all"
          size="sm"
        >
          <Search className="mr-2 h-4 w-4" />
          搜尋地點
        </Button>
      </div>

      <Card className="bg-white/95 backdrop-blur-sm shadow-sm border-blue-200">
        <CardContent className="pt-6 pb-4">
          {mode === "dropdown" ? <LocationForm /> : <SearchInput />}
        </CardContent>
      </Card>
    </div>
  );
}
