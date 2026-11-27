import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Leaf, Calendar as CalendarIcon, MapPin, Package2, Trash2, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import RecommendationDisplay from "@/components/RecommendationDisplay";
import ChemicalLog from "@/components/ChemicalLog";
import { dateLocale, longDatePattern } from "@/i18n";
import { computePlanStartDate, parseDateOnly, parseStoredRecommendation, toDateOnly } from "@/lib/recommendation";
import type { Json } from "@/integrations/supabase/types";

type CropStatus = "planned" | "planted" | "harvested";
const STATUSES: CropStatus[] = ["planned", "planted", "harvested"];

interface UserCrop {
  id: string;
  crop_name: string;
  variety: string | null;
  status: string;
  planting_date: string | null;
  planned_date: string | null;
  area_value: number | null;
  area_unit: string | null;
  field_name: string | null;
  suitability_verdict: string | null;
  recommendations: Json | null;
  created_at: string;
}

/** Plans saved before planStartDate was stored: rebuild the start from the dates we do have. */
function legacyPlanStart(crop: UserCrop): Date {
  const created = new Date(crop.created_at);
  const status = crop.status === "planned" ? "planned" : "planted";
  return parseDateOnly(computePlanStartDate(status, crop.planned_date ?? "", created)) ?? created;
}

const STATUS_STYLE: Record<string, string> = {
  planted: "bg-green-500/10 text-green-700 border-green-500/20",
  planned: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  harvested: "bg-amber-500/10 text-amber-800 border-amber-500/20",
};

const VERDICT_STYLE: Record<string, string> = {
  Plantable: "bg-green-600 hover:bg-green-600",
  Caution: "bg-yellow-500 hover:bg-yellow-500 text-black",
  "Not recommended": "bg-red-600 hover:bg-red-600",
};

const MyCrops = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const locale = dateLocale();
  const [crops, setCrops] = useState<UserCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [cropToDelete, setCropToDelete] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCrop = crops.find((crop) => crop.id === selectedId) ?? null;
  const selectedRecommendation = selectedCrop ? parseStoredRecommendation(selectedCrop.recommendations) : null;

  const formatDateOnly = (value: string) =>
    format(parseDateOnly(value) ?? new Date(value), longDatePattern(), { locale });

  const loadCrops = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("user_crops")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCrops(data || []);
    } catch (error) {
      console.error("Error loading crops:", error);
      toast.error(t("mc_load_failed"));
    } finally {
      setLoading(false);
    }
  }, [navigate, t]);

  useEffect(() => {
    loadCrops();
  }, [loadCrops]);

  // Auto-open the newest crop after saving (AddCrop navigates here with ?open=true)
  useEffect(() => {
    if (searchParams.get("open") === "true" && crops.length > 0) {
      setSelectedId(crops[0].id);
      setSearchParams({}, { replace: true });
    }
  }, [crops, searchParams, setSearchParams]);

  const handleDeleteCrop = async (cropId: string) => {
    try {
      const { error } = await supabase.from("user_crops").delete().eq("id", cropId);
      if (error) throw error;
      toast.success(t("mc_deleted"));
      setCrops((current) => current.filter((crop) => crop.id !== cropId));
    } catch (error) {
      console.error("Error deleting crop:", error);
      toast.error(t("mc_delete_failed"));
    } finally {
      setCropToDelete(null);
    }
  };

  const handleStatusChange = async (crop: UserCrop, status: CropStatus) => {
    if (status === crop.status) return;
    const patch: Partial<UserCrop> = { status };
    // Marking a crop as planted records the planting date if it wasn't known yet.
    if (status === "planted" && !crop.planting_date) {
      const planned = parseDateOnly(crop.planned_date);
      patch.planting_date = planned && planned <= new Date() ? crop.planned_date : toDateOnly(new Date());
    }
    try {
      const { error } = await supabase.from("user_crops").update(patch).eq("id", crop.id);
      if (error) throw error;
      setCrops((current) => current.map((c) => (c.id === crop.id ? { ...c, ...patch } : c)));
      toast.success(t("mc_status_updated"));
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t("mc_status_failed"));
    }
  };

  const statusLabel = (status: string) => t(`status_${status}`, { defaultValue: status });
  const verdictLabel = (verdict: string) => t(`verdict_${verdict}`, { defaultValue: verdict });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Leaf className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">{t("mc_loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} size="icon" aria-label={t("ac_back")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t("my_crops")}</h1>
              <p className="text-muted-foreground">{t("mc_subtitle")}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/add-crop")}>
            <Plus className="w-4 h-4 mr-2" />
            {t("add_crop")}
          </Button>
        </div>

        {crops.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Leaf className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("mc_empty_title")}</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">{t("mc_empty_body")}</p>
              <Button onClick={() => navigate("/add-crop")}>
                <Plus className="w-4 h-4 mr-2" />
                {t("mc_empty_cta")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {crops.map((crop) => (
              <Card key={crop.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-primary" />
                    {crop.crop_name}
                  </CardTitle>
                  {crop.variety && <CardDescription className="mt-1">{crop.variety}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={STATUS_STYLE[crop.status] ?? ""}>
                      {statusLabel(crop.status)}
                    </Badge>
                    {crop.suitability_verdict && (
                      <Badge className={VERDICT_STYLE[crop.suitability_verdict] ?? ""}>
                        {verdictLabel(crop.suitability_verdict)}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {crop.status !== "planned" && crop.planting_date && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{t("mc_planted_on", { date: formatDateOnly(crop.planting_date) })}</span>
                      </div>
                    )}
                    {crop.status === "planned" && crop.planned_date && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{t("mc_planned_for", { date: formatDateOnly(crop.planned_date) })}</span>
                      </div>
                    )}
                    {crop.area_value != null && (
                      <div className="flex items-center gap-2">
                        <Package2 className="w-4 h-4" />
                        <span>
                          {crop.area_value} {crop.area_unit === "m2" ? "m²" : crop.area_unit}
                        </span>
                      </div>
                    )}
                    {crop.field_name && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{crop.field_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mt-auto">
                    {t("mc_added", { when: formatDistanceToNow(new Date(crop.created_at), { addSuffix: true, locale }) })}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedId(crop.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      {t("view")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      aria-label={t("delete")}
                      onClick={() => setCropToDelete(crop.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* View Crop Dialog */}
      <Dialog open={selectedCrop !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              {selectedCrop?.crop_name} {selectedCrop?.variety && `- ${selectedCrop.variety}`}
            </DialogTitle>
            {selectedCrop?.field_name && <DialogDescription>{selectedCrop.field_name}</DialogDescription>}
          </DialogHeader>

          {selectedCrop && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">{t("mc_status")}</p>
                  <Select
                    value={selectedCrop.status}
                    onValueChange={(value) => handleStatusChange(selectedCrop, value as CropStatus)}
                  >
                    <SelectTrigger className="w-full sm:w-48" aria-label={t("mc_status")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">{t("mc_suitability")}</p>
                  {selectedCrop.suitability_verdict && (
                    <Badge className={VERDICT_STYLE[selectedCrop.suitability_verdict] ?? ""}>
                      {verdictLabel(selectedCrop.suitability_verdict)}
                    </Badge>
                  )}
                </div>
              </div>

              {selectedRecommendation ? (
                <RecommendationDisplay
                  recommendation={selectedRecommendation}
                  fallbackStartDate={legacyPlanStart(selectedCrop)}
                  startsOnPlantingDay={
                    !!selectedRecommendation.planStartDate &&
                    selectedRecommendation.planStartDate === selectedCrop.planned_date
                  }
                />
              ) : (
                <p className="text-sm text-muted-foreground">{t("mc_no_rec")}</p>
              )}

              <ChemicalLog cropId={selectedCrop.id} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={cropToDelete !== null} onOpenChange={(open) => !open && setCropToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("mc_delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("mc_delete_body")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cropToDelete && handleDeleteCrop(cropToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyCrops;
