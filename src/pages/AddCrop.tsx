import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import CropSearch from "@/components/CropSearch";
import RecommendationDisplay from "@/components/RecommendationDisplay";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocale } from "@/context/LocaleContext";

const AddCrop = () => {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [variety, setVariety] = useState("");
  const [status, setStatus] = useState<"planned" | "planted">("planned");
  const [plantingDate, setPlantingDate] = useState("");
  const [plannedDate, setPlannedDate] = useState("");
  const [areaValue, setAreaValue] = useState("");
  const [areaUnit, setAreaUnit] = useState<"m2" | "ha">("m2");
  const [plantingMethod, setPlantingMethod] = useState<"direct_seed" | "transplant">("direct_seed");
  const [fieldName, setFieldName] = useState("");
  const [notes, setNotes] = useState("");
  const [chemicalUse, setChemicalUse] = useState<"yes" | "no">("no");
  const [chemicalName, setChemicalName] = useState("");
  const [chemicalDate, setChemicalDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const handleGetRecommendation = async () => {
    if (!selectedCrop) {
      toast.error(t("addCrop.toast.selectCrop"));
      return;
    }

    if (status === "planned" && !plannedDate) {
      toast.error(t("addCrop.toast.enterPlanned"));
      return;
    }

    if (status === "planted" && !plantingDate) {
      toast.error(t("addCrop.toast.enterPlanting"));
      return;
    }

    setLoading(true);

    try {
      // Get user profile with location
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Mock soil and weather data (in production, fetch from APIs)
      const soilData = {
        pH: 6.2,
        nitrogen: "Medium",
        phosphorus: "Low",
        potassium: "Medium",
        organicMatter: "3.5%",
        moisture: "Adequate"
      };

      const weatherData = {
        humidity: 78,
        rainfall: 45,
        tempMin: 15,
        tempMax: 28
      };

      const cropData = {
        cropName: selectedCrop,
        variety,
        status,
        plantingDate,
        plannedDate,
        areaValue: parseFloat(areaValue),
        areaUnit,
        plantingMethod,
        chemicalUse: chemicalUse === "yes",
        chemicalName: chemicalUse === "yes" ? chemicalName : undefined,
        chemicalDate: chemicalUse === "yes" ? chemicalDate : undefined
      };

      const location = {
        lat: profile.location_lat,
        lon: profile.location_lon,
        region: profile.location_region
      };

      // Call edge function for recommendation
      const { data, error } = await supabase.functions.invoke('crop-recommendation', {
        body: { cropData, soilData, weatherData, location }
      });

      if (error) throw error;

      setRecommendation(data);
      toast.success(t("addCrop.toast.generated"));
    } catch (error: any) {
      console.error("Error getting recommendation:", error);
      toast.error(error.message || t("addCrop.toast.failGet"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCrop = async () => {
    if (!selectedCrop || !recommendation) {
      toast.error(t("addCrop.toast.saveFirst"));
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save crop
      const { data: crop, error: cropError } = await supabase
        .from('user_crops')
        .insert({
          user_id: user.id,
          crop_name: selectedCrop,
          variety: variety || null,
          status,
          planting_date: status === "planted" ? plantingDate : null,
          planned_date: status === "planned" ? plannedDate : null,
          area_value: parseFloat(areaValue),
          area_unit: areaUnit,
          planting_method: plantingMethod,
          field_name: fieldName || null,
          notes: notes || null,
          suitability_verdict: recommendation.verdict,
          recommendations: recommendation
        })
        .select()
        .single();

      if (cropError) throw cropError;

      // Save chemical application if reported
      if (chemicalUse === "yes" && chemicalName && crop) {
        const { error: chemError } = await supabase
          .from('chemical_applications')
          .insert({
            user_id: user.id,
            crop_id: crop.id,
            chemical_name: chemicalName,
            application_date: chemicalDate,
            reason: "Pre-planting treatment"
          });

        if (chemError) console.error("Error saving chemical:", chemError);
      }

      toast.success(t("addCrop.toast.saved"));
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving crop:", error);
      toast.error(error.message || t("addCrop.toast.failSave"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("addCrop.back")}
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{t("addCrop.title")}</CardTitle>
            <CardDescription>
              {t("addCrop.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Crop Selection */}
            <CropSearch
              selectedCrop={selectedCrop}
              onSelectCrop={setSelectedCrop}
            />

            <div className="space-y-2">
              <Label htmlFor="variety">{t("addCrop.variety.label")}</Label>
              <Input
                id="variety"
                placeholder={t("addCrop.variety.placeholder")}
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>{t("addCrop.status.label")}</Label>
              <RadioGroup value={status} onValueChange={(v: any) => setStatus(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="planned" id="planned" />
                  <Label htmlFor="planned" className="font-normal cursor-pointer">
                    {t("addCrop.status.planned")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="planted" id="planted" />
                  <Label htmlFor="planted" className="font-normal cursor-pointer">
                    {t("addCrop.status.planted")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Dates */}
            {status === "planned" ? (
              <div className="space-y-2">
                <Label htmlFor="plannedDate">{t("addCrop.date.planned")}</Label>
                <Input
                  id="plannedDate"
                  type="date"
                  value={plannedDate}
                  onChange={(e) => setPlannedDate(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="plantingDate">{t("addCrop.date.planting")}</Label>
                <Input
                  id="plantingDate"
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                />
              </div>
            )}

            {/* Area */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">{t("addCrop.area.label")}</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.01"
                  placeholder="100"
                  value={areaValue}
                  onChange={(e) => setAreaValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">{t("addCrop.unit.label")}</Label>
                <Select value={areaUnit} onValueChange={(v: any) => setAreaUnit(v)}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m2">{t("addCrop.unit.m2")}</SelectItem>
                    <SelectItem value="ha">{t("addCrop.unit.ha")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Planting Method */}
            <div className="space-y-2">
              <Label htmlFor="method">{t("addCrop.method.label")}</Label>
              <Select value={plantingMethod} onValueChange={(v: any) => setPlantingMethod(v)}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_seed">{t("addCrop.method.direct")}</SelectItem>
                  <SelectItem value="transplant">{t("addCrop.method.transplant")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Field Name */}
            {status === "planted" && (
              <div className="space-y-2">
                <Label htmlFor="fieldName">{t("addCrop.field.label")}</Label>
                <Input
                  id="fieldName"
                  placeholder={t("addCrop.field.placeholder")}
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                />
              </div>
            )}

            {/* Chemical Use */}
            <div className="space-y-2">
              <Label>{t("addCrop.chem.label")}</Label>
              <RadioGroup value={chemicalUse} onValueChange={(v: any) => setChemicalUse(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="chem-no" />
                  <Label htmlFor="chem-no" className="font-normal cursor-pointer">
                    {t("addCrop.chem.no")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="chem-yes" />
                  <Label htmlFor="chem-yes" className="font-normal cursor-pointer">
                    {t("addCrop.chem.yes")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {chemicalUse === "yes" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="chemName">{t("addCrop.chem.name")}</Label>
                  <Input
                    id="chemName"
                    placeholder={t("addCrop.chem.name.placeholder")}
                    value={chemicalName}
                    onChange={(e) => setChemicalName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chemDate">{t("addCrop.chem.date")}</Label>
                  <Input
                    id="chemDate"
                    type="date"
                    value={chemicalDate}
                    onChange={(e) => setChemicalDate(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t("addCrop.notes.label")}</Label>
              <Textarea
                id="notes"
                placeholder={t("addCrop.notes.placeholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleGetRecommendation}
                disabled={loading || !selectedCrop}
                className="flex-1"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("addCrop.cta.analyzing")}
                  </>
                ) : (
                  t("addCrop.cta.recommend")
                )}
              </Button>
              
              {recommendation && (
                <>
                  <div className="hidden sm:block h-8 w-px bg-border" />
                  <Button
                    onClick={handleSaveCrop}
                    disabled={loading}
                    variant="default"
                    size="lg"
                  >
                    {t("addCrop.cta.save")}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Display Recommendation */}
        {recommendation && (
          <RecommendationDisplay recommendation={recommendation} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AddCrop;