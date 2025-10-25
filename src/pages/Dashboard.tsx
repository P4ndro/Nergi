import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, MapPin, Plus, AlertTriangle, TrendingUp, Droplets } from "lucide-react";
import { toast } from "sonner";
import LocationPermission from "@/components/LocationPermission";
import Navbar from "@/components/Navbar";
import type { Json } from "@/integrations/supabase/types";

interface Profile {
  id: string;
  name: string | null;
  location_lat: number | null;
  location_lon: number | null;
  location_region: string | null;
  location_consent_given: boolean;
  soil_report_data?: Json | null;
  soil_report_date?: string | null;
  soil_report_location?: string | null;
}

interface SoilReportData {
  pH?: number | null;
  N_ppm?: number | null;
  P_ppm?: number | null;
  K_ppm?: number | null;
  OM_percent?: number | null;
  EC?: number | null;
  notes?: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cropCount, setCropCount] = useState(0);

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
          <p className="text-sm text-muted-foreground">{t('welcome')}, {profile?.name}</p>
        </div>
        {/* Location Badge */}
        <div className="mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="font-medium">{profile?.location_region || t('location_set')}</span>
          <Badge variant="secondary" className="ml-2">{t('active')}</Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/add-crop")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                {t('add_crop')}
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
                {t('my_crops')}
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
                {t('alerts')}
              </CardTitle>
              <CardDescription>
                Current warnings and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">{t('active_alerts')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Soil Status - Only show if user has uploaded a soil report */}
        {profile?.soil_report_data && (() => {
          const soilData = profile.soil_report_data as SoilReportData;
          return (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Soil Status - {profile?.location_region}
                </CardTitle>
                <CardDescription>
                  From your soil report {profile.soil_report_location && `(${profile.soil_report_location})`}
                  {profile.soil_report_date && ` - ${new Date(profile.soil_report_date).toLocaleDateString()}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {/* pH Level */}
                  {soilData.pH && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">pH Level</p>
                      <p className="text-2xl font-bold">{soilData.pH.toFixed(1)}</p>
                      <Badge variant={
                        soilData.pH >= 6.0 && soilData.pH <= 7.0 
                          ? "secondary" 
                          : "outline"
                      }>
                        {soilData.pH >= 6.0 && soilData.pH <= 7.0 ? "Good" : "Check"}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Nitrogen */}
                  {soilData.N_ppm !== null && soilData.N_ppm !== undefined && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Nitrogen</p>
                      <p className="text-2xl font-bold">{soilData.N_ppm}</p>
                      <p className="text-xs text-muted-foreground">ppm</p>
                    </div>
                  )}
                  
                  {/* Phosphorus */}
                  {soilData.P_ppm !== null && soilData.P_ppm !== undefined && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Phosphorus</p>
                      <p className="text-2xl font-bold">{soilData.P_ppm}</p>
                      <p className="text-xs text-muted-foreground">ppm</p>
                    </div>
                  )}
                  
                  {/* Potassium */}
                  {soilData.K_ppm !== null && soilData.K_ppm !== undefined && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Potassium</p>
                      <p className="text-2xl font-bold">{soilData.K_ppm}</p>
                      <p className="text-xs text-muted-foreground">ppm</p>
                    </div>
                  )}
                  
                  {/* Organic Matter */}
                  {soilData.OM_percent !== null && soilData.OM_percent !== undefined && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Organic Matter</p>
                      <p className="text-2xl font-bold">{soilData.OM_percent}%</p>
                    </div>
                  )}
                </div>
                
                {/* Notes from soil report if available */}
                {soilData.notes && (
                  <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Analysis Notes</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {soilData.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}
        
        {/* Placeholder if no soil report uploaded */}
        {!profile?.soil_report_data && (
          <Card className="mb-8 border-dashed">
            <CardContent className="pt-6 pb-6 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">No Soil Report Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a soil lab report when adding a crop to see your soil analysis here
              </p>
              <Button onClick={() => navigate("/add-crop")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Crop with Soil Report
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Weather Warning */}
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              {t('weather_alert')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-medium">{t('fungal_risk_moderate')}</span> {t('weather_risk_copy')}
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              {t('view_details')}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;