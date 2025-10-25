import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Leaf, Calendar as CalendarIcon, MapPin, Package2, Trash2, Eye, Plus, X } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocale } from "@/context/LocaleContext";
import { formatDistanceToNow } from "date-fns";

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
  recommendations: any;
  created_at: string;
}

const MyCrops = () => {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [crops, setCrops] = useState<UserCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cropToDelete, setCropToDelete] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<UserCrop | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    loadCrops();
  }, []);

  // Auto-open latest crop if URL has query param
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const openLatest = urlParams.get('open');
    
    if (openLatest === 'true' && crops.length > 0 && !viewDialogOpen) {
      const timer = setTimeout(() => {
        // Open the most recently added crop
        setSelectedCrop(crops[0]);
        setViewDialogOpen(true);
        // Clean up URL
        window.history.replaceState({}, '', '/my-crops');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [crops.length]);

  const loadCrops = async () => {
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
    } catch (error: any) {
  console.error("Error loading crops:", error);
  toast.error(t("mycrops.toasts.loadFail"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    try {
      const { error } = await supabase
        .from("user_crops")
        .delete()
        .eq("id", cropId);

      if (error) throw error;
      
  toast.success(t("mycrops.toasts.deleted"));
      setCrops(crops.filter(crop => crop.id !== cropId));
    } catch (error: any) {
  console.error("Error deleting crop:", error);
  toast.error(t("mycrops.toasts.deleteFail"));
    } finally {
      setDeleteDialogOpen(false);
      setCropToDelete(null);
    }
  };

  const getVerdictColor = (verdict: string | null) => {
    if (!verdict) return "bg-secondary";
    switch (verdict.toLowerCase()) {
      case "plantable":
        return "bg-green-500";
      case "caution":
        return "bg-yellow-500";
      case "not recommended":
        return "bg-red-500";
      default:
        return "bg-secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planted":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "planned":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-secondary";
    }
  };


  const handleViewCrop = (crop: UserCrop) => {
    setSelectedCrop(crop);
    setViewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Leaf className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">{t("mycrops.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t("mycrops.title")}</h1>
              <p className="text-muted-foreground">{t("mycrops.subtitle")}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/add-crop")}>
            <Plus className="w-4 h-4 mr-2" />
            {t("mycrops.addCrop")}
          </Button>
        </div>

        {crops.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Leaf className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("mycrops.empty.title")}</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                {t("mycrops.empty.subtitle")}
              </p>
              <Button onClick={() => navigate("/add-crop")}>
                <Plus className="w-4 h-4 mr-2" />
                {t("mycrops.empty.addFirst")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {crops.map((crop) => (
              <Card key={crop.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-primary" />
                        {crop.crop_name}
                      </CardTitle>
                      {crop.variety && (
                        <CardDescription className="mt-1">
                          {crop.variety}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status and Verdict */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={getStatusColor(crop.status)}>
                      {crop.status}
                    </Badge>
                    {crop.suitability_verdict && (
                      <Badge className={getVerdictColor(crop.suitability_verdict)}>
                        {crop.suitability_verdict}
                      </Badge>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 text-sm">
                    {crop.status === "planted" && crop.planting_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {t("mycrops.dates.planted")} {new Date(crop.planting_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {crop.status === "planned" && crop.planned_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {t("mycrops.dates.planned")} {new Date(crop.planned_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Area */}
                  {crop.area_value && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package2 className="w-4 h-4" />
                      <span>
                        {crop.area_value} {crop.area_unit}
                      </span>
                    </div>
                  )}

                  {/* Field Name */}
                  {crop.field_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{crop.field_name}</span>
                    </div>
                  )}

                  {/* Created Time */}
                  <div className="text-xs text-muted-foreground">
                    {t("mycrops.addedPrefix")} {formatDistanceToNow(new Date(crop.created_at), { addSuffix: true })}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewCrop(crop)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t("mycrops.view")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setCropToDelete(crop.id);
                        setDeleteDialogOpen(true);
                      }}
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
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              {selectedCrop?.crop_name} {selectedCrop?.variety && `- ${selectedCrop.variety}`}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCrop && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedCrop.status)}>
                    {selectedCrop.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Suitability</p>
                  {selectedCrop.suitability_verdict && (
                    <Badge className={getVerdictColor(selectedCrop.suitability_verdict)}>
                      {selectedCrop.suitability_verdict}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Summary */}
              {selectedCrop.recommendations?.summary && (
                <Alert>
                  <AlertDescription>{selectedCrop.recommendations.summary}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              {selectedCrop.recommendations?.actions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {selectedCrop.recommendations.actions.map((action: string, idx: number) => (
                        <li key={idx} className="flex gap-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </span>
                          <p className="text-sm">{action}</p>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* Weekly Calendar */}
              {selectedCrop.recommendations?.calendar && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      4-Week Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedCrop.recommendations.calendar.map((week: any) => (
                        <div key={week.week} className="border-l-2 border-primary pl-4">
                          <p className="font-semibold mb-2">Week {week.week}</p>
                          <ul className="space-y-1">
                            {week.tasks.map((task: string, idx: number) => {
                              const isMedicineTask = task.toLowerCase().includes("spray") ||
                                task.toLowerCase().includes("pesticide") ||
                                task.toLowerCase().includes("fungicide") ||
                                task.toLowerCase().includes("medicine") ||
                                task.toLowerCase().includes("apply") ||
                                task.toLowerCase().includes("chemical");
                              return (
                                <li
                                  key={idx}
                                  className={`text-sm ${isMedicineTask ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                                >
                                  • {task}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Risks */}
              {selectedCrop.recommendations?.risks && selectedCrop.recommendations.risks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedCrop.recommendations.risks.map((risk: any, idx: number) => (
                      <Alert key={idx}>
                        <AlertDescription>
                          <div className="flex items-start gap-2 justify-between mb-2">
                            <Badge variant="outline" className={
                              risk.severity === "Low" ? "text-green-600" :
                              risk.severity === "Moderate" ? "text-yellow-600" :
                              "text-red-600"
                            }>
                              {risk.severity}
                            </Badge>
                            <Badge variant="secondary">{risk.type}</Badge>
                          </div>
                          <p className="text-sm mb-1">{risk.description}</p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Mitigation:</span> {risk.mitigation}
                          </p>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Soil Amendments */}
              {selectedCrop.recommendations?.soilAmendments && selectedCrop.recommendations.soilAmendments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Soil Amendments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedCrop.recommendations.soilAmendments.map((amendment: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">{amendment}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("mycrops.confirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("mycrops.confirm.desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("mycrops.confirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cropToDelete && handleDeleteCrop(cropToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("mycrops.confirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Footer />
    </div>
  );
};

export default MyCrops;

