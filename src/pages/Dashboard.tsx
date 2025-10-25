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
import Footer from "@/components/Footer";
import { useLocale } from "@/context/LocaleContext";

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
  const { t } = useLocale();
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
  toast.error(t("dashboard.toasts.profileFail"));
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
          <p className="text-muted-foreground">{t("dashboard.loading")}</p>
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
          <p className="text-sm text-muted-foreground">{t("dashboard.welcome")} {profile?.name}</p>
        </div>
        {/* Location Badge */}
        <div className="mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="font-medium">{profile?.location_region || t("dashboard.location.set")}</span>
          <Badge variant="secondary" className="ml-2">{t("dashboard.active")}</Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/add-crop")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                {t("dashboard.quick.addCrop.title")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.quick.addCrop.desc")}
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
                {t("dashboard.quick.myCrops.title")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.quick.myCrops.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{cropCount}</p>
              <p className="text-sm text-muted-foreground">{t("dashboard.quick.myCrops.active")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                {t("dashboard.quick.alerts.title")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.quick.alerts.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">{t("dashboard.quick.alerts.active")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Soil Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t("dashboard.soil.title")} - {profile?.location_region}
            </CardTitle>
            <CardDescription>
              {t("dashboard.soil.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("dashboard.soil.ph")}</p>
                <p className="text-2xl font-bold">{soilData.pH}</p>
                <Badge variant="secondary">{t("dashboard.badge.good")}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("dashboard.soil.nitrogen")}</p>
                <p className="text-2xl font-bold">{soilData.nitrogen}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("dashboard.soil.phosphorus")}</p>
                <p className="text-2xl font-bold">{soilData.phosphorus}</p>
                <Badge variant="destructive">{t("dashboard.badge.low")}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t("dashboard.soil.potassium")}</p>
                <p className="text-2xl font-bold">{soilData.potassium}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Droplets className="w-4 h-4" />
                  {t("dashboard.soil.moisture")}
                </p>
                <p className="text-2xl font-bold">{soilData.moisture}</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{t("dashboard.recommendation.title")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("dashboard.recommendation.text")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Warning */}
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              {t("dashboard.weather.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{t("dashboard.weather.text")}</p>
            <Button variant="outline" size="sm" className="mt-4">
              {t("dashboard.weather.viewDetails")}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;