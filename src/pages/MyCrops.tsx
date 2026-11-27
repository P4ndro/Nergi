import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Leaf, Calendar as CalendarIcon, MapPin, Package2, Trash2, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { formatDistanceToNow } from "date-fns";
import RecommendationDisplay from "@/components/RecommendationDisplay";
import {
  computePlanStartDate,
  parseDateOnly,
  parseStoredRecommendation,
  type Recommendation,
} from "@/lib/recommendation";
import type { Json } from "@/integrations/supabase/types";

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

function planStartLabel(crop: UserCrop, rec: Recommendation): string {
  const start = rec.planStartDate;
  if (crop.status === "planned" && start && start === crop.planned_date) return "Planting day";
  return "Plan starts";
}

function formatDateOnly(value: string): string {
  return (parseDateOnly(value) ?? new Date(value)).toLocaleDateString();
}

const MyCrops = () => {
  const navigate = useNavigate();
  const [crops, setCrops] = useState<UserCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cropToDelete, setCropToDelete] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<UserCrop | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRecommendation = selectedCrop ? parseStoredRecommendation(selectedCrop.recommendations) : null;

  // Auto-open the newest crop after saving (AddCrop navigates here with ?open=true)
  useEffect(() => {
    if (searchParams.get("open") === "true" && crops.length > 0) {
      setSelectedCrop(crops[0]);
      setViewDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [crops, searchParams, setSearchParams]);

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
      toast.error("Failed to load crops");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadCrops();
  }, [loadCrops]);

  const handleDeleteCrop = async (cropId: string) => {
    try {
      const { error } = await supabase
        .from("user_crops")
        .delete()
        .eq("id", cropId);

      if (error) throw error;
      
      toast.success("Crop deleted successfully");
      setCrops((current) => current.filter((crop) => crop.id !== cropId));
    } catch (error) {
      console.error("Error deleting crop:", error);
      toast.error("Failed to delete crop");
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
            <p className="text-muted-foreground">Loading your crops...</p>
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
              <h1 className="text-3xl font-bold">My Crops</h1>
              <p className="text-muted-foreground">
                Manage and track all your crops
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/add-crop")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Crop
          </Button>
        </div>

        {crops.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Leaf className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No crops yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Get started by adding your first crop. Track planting dates, receive recommendations, and manage your farm.
              </p>
              <Button onClick={() => navigate("/add-crop")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Crop
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
                          Planted: {formatDateOnly(crop.planting_date)}
                        </span>
                      </div>
                    )}
                    {crop.status === "planned" && crop.planned_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          Planned: {formatDateOnly(crop.planned_date)}
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
                    Added {formatDistanceToNow(new Date(crop.created_at), { addSuffix: true })}
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
                      View
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

              {selectedRecommendation ? (
                <RecommendationDisplay
                  recommendation={selectedRecommendation}
                  fallbackStartDate={legacyPlanStart(selectedCrop)}
                  startLabel={planStartLabel(selectedCrop, selectedRecommendation)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No recommendation was saved for this crop.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the crop and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cropToDelete && handleDeleteCrop(cropToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyCrops;

