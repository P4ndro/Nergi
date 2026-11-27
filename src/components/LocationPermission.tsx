import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface LocationPermissionProps {
  onLocationGranted: () => void | Promise<void>;
  onSkip: () => void;
}

interface LocationSearchResult {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

const WEATHER_API_KEY = import.meta.env.VITE_WEATHERAPI_KEY;

const LocationPermission = ({ onLocationGranted, onSkip }: LocationPermissionProps) => {
  const [busyAction, setBusyAction] = useState<"location" | "search" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);

  const saveLocation = async (latitude: number, longitude: number, region: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Please sign in before saving a location.");

      const { error } = await supabase
        .from("profiles")
        .update({
          location_lat: latitude,
          location_lon: longitude,
          location_region: region,
          location_consent_given: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Location saved successfully!");
      await onLocationGranted();
    } catch (error) {
      console.error("Failed to save location:", error);
      toast.error(`Failed to save location: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleGrantLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser. Search for a location instead.");
      return;
    }

    setBusyAction("location");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        void describeLocation(coords.latitude, coords.longitude).then((label) =>
          saveLocation(coords.latitude, coords.longitude, label),
        );
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Could not get your location. You can search for a place instead.");
        setBusyAction(null);
      },
    );
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      toast.error("Enter a city or place to search.");
      return;
    }
    if (!WEATHER_API_KEY) {
      toast.error("Location search is unavailable because the weather API key is not configured.");
      return;
    }

    setBusyAction("search");
    setSearchResults([]);
    try {
      const params = new URLSearchParams({ key: WEATHER_API_KEY, q: query });
      const response = await fetch(`https://api.weatherapi.com/v1/search.json?${params}`);
      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? (data as { error?: { message?: string } }).error?.message
            : undefined;
        throw new Error(message || `Location search failed (${response.status}).`);
      }
      if (!Array.isArray(data)) throw new Error("Unexpected response from the location search service.");

      const results = data as LocationSearchResult[];
      setSearchResults(results);
      if (results.length === 0) toast.info("No matching locations found.");
    } catch (error) {
      console.error("Location search failed:", error);
      toast.error(error instanceof Error ? error.message : "Location search failed.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleSelectLocation = (location: LocationSearchResult) => {
    const label = [location.name, location.region, location.country].filter(Boolean).join(", ");
    setBusyAction("location");
    void saveLocation(location.lat, location.lon, label);
  };

  // Turns coordinates into a readable place name using the weather service's lookup.
  const describeLocation = async (lat: number, lon: number): Promise<string> => {
    const fallback = `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
    if (!WEATHER_API_KEY) return fallback;
    try {
      const params = new URLSearchParams({ key: WEATHER_API_KEY, q: `${lat},${lon}` });
      const response = await fetch(`https://api.weatherapi.com/v1/search.json?${params}`);
      if (!response.ok) return fallback;
      const data: unknown = await response.json();
      const place = Array.isArray(data) ? (data[0] as Partial<LocationSearchResult> | undefined) : undefined;
      if (!place?.name) return fallback;
      return [place.name, place.region, place.country].filter(Boolean).join(", ");
    } catch {
      return fallback;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Set a location (optional)</CardTitle>
            <CardDescription>
              Use your current location or search for a city to get local weather and crop recommendations.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Your location is only saved when you choose to use or search for one. You can skip this and continue without location-based data.</p>
        </div>

        <Button
          onClick={handleGrantLocation}
          disabled={busyAction !== null}
          size="lg"
          variant="outline"
          className="w-full"
        >
          {busyAction === "location" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
          Use my current location
        </Button>

        <div className="text-center text-sm text-muted-foreground">or search for a place</div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            aria-label="Search for a city or place"
            placeholder="City, region, or country"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            disabled={busyAction !== null}
          />
          <Button type="submit" disabled={busyAction !== null}>
            {busyAction === "search" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2">Search</span>
          </Button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-2" aria-label="Location search results">
            {searchResults.map((result) => (
              <Button
                key={`${result.id}-${result.lat}-${result.lon}`}
                type="button"
                variant="outline"
                className="h-auto w-full justify-start whitespace-normal py-3 text-left"
                disabled={busyAction !== null}
                onClick={() => handleSelectLocation(result)}
              >
                {result.name}{result.region ? `, ${result.region}` : ""}{result.country ? `, ${result.country}` : ""}
              </Button>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="button" variant="ghost" onClick={onSkip} disabled={busyAction !== null}>
            Not now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPermission;