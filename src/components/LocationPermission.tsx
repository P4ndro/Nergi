import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LocationPermissionProps {
  onLocationGranted: () => void;
}

const LocationPermission = ({ onLocationGranted }: LocationPermissionProps) => {
  const [loading, setLoading] = useState(false);

  const handleGrantLocation = async () => {
    setLoading(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Determine region (simplified - in production, use proper geocoding)
        const region = determineRegion(latitude, longitude);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { error } = await supabase
              .from('profiles')
              .update({
                location_lat: latitude,
                location_lon: longitude,
                location_region: region,
                location_consent_given: true,
              })
              .eq('id', user.id);

            if (error) throw error;

            toast.success("Location saved successfully!");
            onLocationGranted();
          }
        } catch (error: any) {
          toast.error("Failed to save location: " + error.message);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Failed to get location. Please enable location services.");
        setLoading(false);
      }
    );
  };

  const determineRegion = (lat: number, lon: number): string => {
    // Simplified region detection for Georgia
    // In production, use proper geocoding service
    if (lat > 42.5 && lon < 42) return "Samegrelo";
    if (lat > 41.5 && lon > 45) return "Kakheti";
    if (lat > 42 && lon > 43) return "Kartli";
    return "Georgia";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Location Access</CardTitle>
          <CardDescription>
            Nergi needs your location to provide personalized crop recommendations based on your local soil and weather conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">We use your location to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Provide region-specific planting recommendations</li>
                  <li>Access local soil and weather data</li>
                  <li>Warn about regional pest risks</li>
                  <li>Suggest optimal planting times</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleGrantLocation}
              className="w-full"
              disabled={loading}
              size="lg"
            >
              {loading ? "Getting location..." : "Grant Location Access"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Your location data is stored securely and used only for providing agricultural recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationPermission;