import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, MapPin, Plus, AlertTriangle, TrendingUp, CloudSun } from "lucide-react";
import { toast } from "sonner";
import LocationPermission from "@/components/LocationPermission";
import Navbar from "@/components/Navbar";
import type { Json } from "@/integrations/supabase/types";
import { fetchWeatherData, type WeatherData } from "@/lib/weather-api";
import { parseStoredRecommendation } from "@/lib/recommendation";
import { dateLocale, longDatePattern } from "@/i18n";

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
  notes?: string | null;
}

const SoilValue = ({ label, value, unit }: { label: string; value: number | null | undefined; unit?: string }) =>
  value === null || value === undefined ? null : (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cropCount, setCropCount] = useState(0);
  const [showLocationSetup, setShowLocationSetup] = useState(false);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const hasLocation = profile?.location_lat != null && profile.location_lon != null;

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error(t("dash_profile_failed"));
    } finally {
      setLoading(false);
    }
  }, [navigate, t]);

  const loadCrops = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_crops")
        .select("status, recommendations")
        .eq("user_id", user.id);

      if (error) throw error;
      const active = (data ?? []).filter((crop) => crop.status !== "harvested");
      setCropCount(active.length);
      setHighRiskCount(
        active.reduce((total, crop) => {
          const rec = parseStoredRecommendation(crop.recommendations);
          return total + (rec?.risks.filter((risk) => risk.severity === "High").length ?? 0);
        }, 0),
      );
    } catch (error) {
      console.error("Error loading crops:", error);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadCrops();
  }, [loadProfile, loadCrops]);

  useEffect(() => {
    const lat = profile?.location_lat;
    const lon = profile?.location_lon;
    if (lat == null || lon == null) {
      setWeather(null);
      return;
    }
    let cancelled = false;
    fetchWeatherData(lat, lon).then((data) => {
      if (!cancelled) setWeather(data);
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.location_lat, profile?.location_lon]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">{t("dash_loading")}</p>
        </div>
      </div>
    );
  }

  const soilData = (profile?.soil_report_data ?? null) as SoilReportData | null;
  const phGood = typeof soilData?.pH === "number" && soilData.pH >= 6.0 && soilData.pH <= 7.0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {profile?.name && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {t("welcome")}, {profile.name}
            </p>
          </div>
        )}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {hasLocation ? profile?.location_region || t("location_set") : t("location_not_set")}
            </p>
            {!hasLocation && <p className="text-sm text-muted-foreground">{t("location_optional")}</p>}
          </div>
          {hasLocation && <Badge variant="secondary">{t("active")}</Badge>}
          <Button variant="outline" size="sm" onClick={() => setShowLocationSetup((show) => !show)}>
            {showLocationSetup ? t("close") : hasLocation ? t("location_change") : t("location_set_btn")}
          </Button>
        </div>
        {showLocationSetup && (
          <div className="mb-8">
            <LocationPermission
              onLocationGranted={async () => {
                await loadProfile();
                setShowLocationSetup(false);
              }}
              onSkip={() => setShowLocationSetup(false)}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/add-crop")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                {t("add_crop")}
              </CardTitle>
              <CardDescription>{t("dash_add_desc")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/my-crops")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-success" />
                {t("my_crops")}
              </CardTitle>
              <CardDescription>{t("dash_crops_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{cropCount}</p>
              <p className="text-sm text-muted-foreground">{t("active_crops")}</p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate("/my-crops")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                {t("alerts")}
              </CardTitle>
              <CardDescription>{t("alerts_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{highRiskCount}</p>
              <p className="text-sm text-muted-foreground">{t("alerts_count_label")}</p>
            </CardContent>
          </Card>
        </div>

        {hasLocation && weather && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-primary" />
                {t("weather")}
              </CardTitle>
              <CardDescription>{weather.isEstimate ? t("weather_estimate") : t("weather_live")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("weather_now")}</p>
                  <p className="text-2xl font-bold">{Math.round(weather.currentTemp)}°C</p>
                  <p className="text-xs text-muted-foreground">{weather.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("weather_range")}</p>
                  <p className="text-2xl font-bold">
                    {Math.round(weather.tempMin)}° / {Math.round(weather.tempMax)}°
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("weather_humidity")}</p>
                  <p className="text-2xl font-bold">{weather.humidity}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("weather_rain")}</p>
                  <p className="text-2xl font-bold">{Math.round(weather.rainfall)} mm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {soilData ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t("soil_status")}
              </CardTitle>
              <CardDescription>
                {t("soil_from_report")}
                {profile?.soil_report_location && ` (${profile.soil_report_location})`}
                {profile?.soil_report_date &&
                  ` · ${format(new Date(profile.soil_report_date), longDatePattern(), { locale: dateLocale() })}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {typeof soilData.pH === "number" && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{t("ph_level")}</p>
                    <p className="text-2xl font-bold">{soilData.pH.toFixed(1)}</p>
                    <Badge variant={phGood ? "secondary" : "outline"}>{phGood ? t("ph_good") : t("ph_check")}</Badge>
                  </div>
                )}
                <SoilValue label={t("nitrogen")} value={soilData.N_ppm} unit="ppm" />
                <SoilValue label={t("phosphorus")} value={soilData.P_ppm} unit="ppm" />
                <SoilValue label={t("potassium")} value={soilData.K_ppm} unit="ppm" />
                <SoilValue label={t("organic_matter")} value={soilData.OM_percent} unit="%" />
              </div>

              {soilData.notes && (
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="font-medium">{t("analysis_notes")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{soilData.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-dashed">
            <CardContent className="pt-6 pb-6 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">{t("no_soil_title")}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t("no_soil_body")}</p>
              <Button onClick={() => navigate("/add-crop")}>
                <Plus className="w-4 h-4 mr-2" />
                {t("no_soil_cta")}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
