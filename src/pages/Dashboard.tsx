import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, MapPin, Plus, AlertTriangle, TrendingUp, Droplets } from "lucide-react";
import { toast } from "sonner";
import LocationPermission from "@/components/LocationPermission";
import Navbar from "@/components/Navbar";
import { AlertCalendar } from "@/components/AlertCalendar";

interface Profile {
  id: string;
  name: string | null;
  location_lat: number | null;
  location_lon: number | null;
  location_region: string | null;
  location_consent_given: boolean;
}

interface SoilData {
  pH: number;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  moisture: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cropCount, setCropCount] = useState(0);
  const [soilData] = useState<SoilData>({
    pH: 6.2,
    nitrogen: "Medium",
    phosphorus: "Low",
    potassium: "Medium",
    moisture: "Adequate"
  });

  useEffect(() => {
    loadProfile();
    loadCropCount();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadCropCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { count, error } = await supabase
        .from('user_crops')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      setCropCount(count || 0);
    } catch (error: any) {
      console.error("Error loading crop count:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile?.location_consent_given) {
    return <LocationPermission onLocationGranted={loadProfile} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Welcome, {profile?.name}</p>
        </div>
        {/* Location Badge */}
        <div className="mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="font-medium">{profile?.location_region || "Location set"}</span>
          <Badge variant="secondary" className="ml-2">Active</Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/add-crop")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add Crop
              </CardTitle>
              <CardDescription>
                Plan a new crop or record a planted one
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate("/my-crops")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-success" />
                My Crops
              </CardTitle>
              <CardDescription>
                View and manage your crops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{cropCount}</p>
              <p className="text-sm text-muted-foreground">Active crops</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Alerts
              </CardTitle>
              <CardDescription>
                Current warnings and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Active alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Soil Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Soil Status - {profile?.location_region}
            </CardTitle>
            <CardDescription>
              Current soil conditions at your location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">pH Level</p>
                <p className="text-2xl font-bold">{soilData.pH}</p>
                <Badge variant="secondary">Good</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Nitrogen</p>
                <p className="text-2xl font-bold">{soilData.nitrogen}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Phosphorus</p>
                <p className="text-2xl font-bold">{soilData.phosphorus}</p>
                <Badge variant="destructive">Low</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Potassium</p>
                <p className="text-2xl font-bold">{soilData.potassium}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Droplets className="w-4 h-4" />
                  Moisture
                </p>
                <p className="text-2xl font-bold">{soilData.moisture}</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Recommendation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Phosphorus levels are low. Consider adding organic compost or bone meal before planting phosphorus-demanding crops.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Calendar with Weather Monitoring */}
        {profile?.id && <AlertCalendar userId={profile.id} />}

        {/* Weather Warning */}
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Weather Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-medium">Moderate fungal risk:</span> High humidity (78% avg) and recent rainfall increase fungal disease risk. Monitor plants closely and ensure good air circulation.
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              View Details
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;