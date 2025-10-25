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

const AddCrop = () => {
  const navigate = useNavigate();
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
      toast.error("Please select a crop first");
      return;
    }

    if (status === "planned" && !plannedDate) {
      toast.error("Please enter planned planting date");
      return;
    }

    if (status === "planted" && !plantingDate) {
      toast.error("Please enter planting date");
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
      toast.success("Recommendation generated!");
    } catch (error: any) {
      console.error("Error getting recommendation:", error);
      toast.error(error.message || "Failed to get recommendation");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCrop = async () => {
    if (!selectedCrop || !recommendation) {
      toast.error("Please get a recommendation first");
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

      toast.success("Crop saved successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving crop:", error);
      toast.error(error.message || "Failed to save crop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Add Crop</CardTitle>
            <CardDescription>
              Search for your crop and provide details to get AI-powered recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Crop Selection */}
            <CropSearch
              selectedCrop={selectedCrop}
              onSelectCrop={setSelectedCrop}
            />

            <div className="space-y-2">
              <Label htmlFor="variety">Variety (optional)</Label>
              <Input
                id="variety"
                placeholder="e.g., Golden Bantam"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup value={status} onValueChange={(v: any) => setStatus(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="planned" id="planned" />
                  <Label htmlFor="planned" className="font-normal cursor-pointer">
                    Planning to plant
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="planted" id="planted" />
                  <Label htmlFor="planted" className="font-normal cursor-pointer">
                    Already planted
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Dates */}
            {status === "planned" ? (
              <div className="space-y-2">
                <Label htmlFor="plannedDate">Planned Planting Date</Label>
                <Input
                  id="plannedDate"
                  type="date"
                  value={plannedDate}
                  onChange={(e) => setPlannedDate(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="plantingDate">Planting Date</Label>
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
                <Label htmlFor="area">Area</Label>
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
                <Label htmlFor="unit">Unit</Label>
                <Select value={areaUnit} onValueChange={(v: any) => setAreaUnit(v)}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m2">Square meters (m²)</SelectItem>
                    <SelectItem value="ha">Hectares (ha)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Planting Method */}
            <div className="space-y-2">
              <Label htmlFor="method">Planting Method</Label>
              <Select value={plantingMethod} onValueChange={(v: any) => setPlantingMethod(v)}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_seed">Direct Seed</SelectItem>
                  <SelectItem value="transplant">Transplant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Field Name */}
            {status === "planted" && (
              <div className="space-y-2">
                <Label htmlFor="fieldName">Field/Location Name (optional)</Label>
                <Input
                  id="fieldName"
                  placeholder="e.g., North Field"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                />
              </div>
            )}

            {/* Chemical Use */}
            <div className="space-y-2">
              <Label>Recent chemical/pesticide use?</Label>
              <RadioGroup value={chemicalUse} onValueChange={(v: any) => setChemicalUse(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="chem-no" />
                  <Label htmlFor="chem-no" className="font-normal cursor-pointer">
                    No
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="chem-yes" />
                  <Label htmlFor="chem-yes" className="font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {chemicalUse === "yes" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="chemName">Chemical/Pesticide Name</Label>
                  <Input
                    id="chemName"
                    placeholder="Product name"
                    value={chemicalName}
                    onChange={(e) => setChemicalName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chemDate">Application Date</Label>
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
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleGetRecommendation}
                disabled={loading || !selectedCrop}
                className="flex-1"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Get Recommendation"
                )}
              </Button>
              
              {recommendation && (
                <Button
                  onClick={handleSaveCrop}
                  disabled={loading}
                  variant="default"
                  size="lg"
                >
                  Save Crop
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Display Recommendation */}
        {recommendation && (
          <RecommendationDisplay recommendation={recommendation} />
        )}
      </main>
    </div>
  );
};

export default AddCrop;