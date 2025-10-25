import { useState } from "react";
// PDF parsing for soil report
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - pdfjs provides its own types
import * as pdfjsLib from "pdfjs-dist/build/pdf";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - vite will resolve the worker url
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Leaf } from "lucide-react";
import { toast } from "sonner";
import CropSearch from "@/components/CropSearch";
import RecommendationDisplay from "@/components/RecommendationDisplay";
import Navbar from "@/components/Navbar";
import { fetchWeatherData } from "@/lib/weather-api";

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
  const [soilReportFile, setSoilReportFile] = useState<File | null>(null);
  const [soilReportText, setSoilReportText] = useState<string>("");
  const [formHidden, setFormHidden] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [chemicalUse, setChemicalUse] = useState<"yes" | "no">("no");
  const [chemicalName, setChemicalName] = useState("");
  const [chemicalDate, setChemicalDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const preprocessImageForOCR = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const maxW = 2000;
        const scale = Math.min(1, maxW / img.width);
        const w = Math.floor(img.width * scale);
        const h = Math.floor(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, w, h);
        // Simple grayscale + contrast boost
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const contrast = 1.2; // 20% boost
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          // grayscale
          let v = 0.299 * r + 0.587 * g + 0.114 * b;
          // contrast
          v = (v - 128) * contrast + 128;
          v = Math.max(0, Math.min(255, v));
          data[i] = data[i + 1] = data[i + 2] = v;
        }
        ctx.putImageData(imgData, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to export preprocessed image'));
        }, 'image/png');
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleSoilReportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSoilReportFile(file);
    setSoilReportText("");
    if (!file) return;

    try {
      // Parse PDF
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
        let text = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pageText = content.items.map((i: any) => (i.str || "")).join(" ");
          text += `\n\n[Page ${pageNum}]\n` + pageText;
        }
        const trimmed = text.slice(0, 100000);
        setSoilReportText(trimmed);
        if (trimmed.length > 0) toast.success("Parsed soil report (PDF)");
        return;
      }

      // Parse text/CSV
      const isTextLike = file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".csv") || file.name.toLowerCase().endsWith(".txt");
      if (isTextLike) {
        const text = await file.text();
        const trimmed = text.slice(0, 100000);
        setSoilReportText(trimmed);
        if (trimmed.length > 0) toast.success("Parsed soil report (text)");
        return;
      }

      // OCR for screenshots/images (basic EN). Add KA by changing lang below
      if (file.type.startsWith("image/")) {
        toast.message("Running OCR on image... this may take a moment");
        const pre = await preprocessImageForOCR(file);
        const Tesseract = await import("tesseract.js");
        const { data } = await Tesseract.default.recognize(pre, "eng");
        let ocrText = (data?.text || "").trim();
        // Fallback to OCR.space with table mode if Tesseract is too weak
        const OCR_KEY = import.meta.env.VITE_OCR_SPACE_API_KEY as string | undefined;
        if (ocrText.length < 120 && OCR_KEY) {
          try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('isTable', 'true');
            fd.append('OCREngine', '2');
            fd.append('language', 'eng');
            const resp = await fetch('https://api.ocr.space/parse/image', {
              method: 'POST',
              headers: { apikey: OCR_KEY },
              body: fd,
            });
            const json = await resp.json();
            const parsed = json?.ParsedResults?.[0]?.ParsedText as string | undefined;
            if (parsed && parsed.trim().length > 0) {
              ocrText = parsed.trim();
            }
          } catch (err) {
            console.warn('OCR.space fallback failed', err);
          }
        }
        const trimmed = ocrText.slice(0, 100000);
        setSoilReportText(trimmed);
        if (trimmed.length > 0) {
          toast.success("Parsed soil report (image OCR)");
        } else {
          toast.error("Could not read text from image. Try uploading a PDF or text file.");
        }
        return;
      }
    } catch (err) {
      console.error("Failed to read soil report:", err);
      toast.error("Failed to read soil report file");
    }
  };

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

    // Basic eligibility check for report (optional but recommended)
    if (soilReportFile) {
      const allowed = ["application/pdf", "text/plain", "text/csv"]; // images allowed via accept, but we don't OCR yet
      const isAllowed = allowed.includes(soilReportFile.type) || soilReportFile.type.startsWith("image/");
      if (!isAllowed) {
        toast.error("Unsupported file type. Upload PDF, text, CSV, or image.");
        return;
      }
      if (soilReportFile.size > 10 * 1024 * 1024) {
        toast.error("File too large. Max 10MB.");
        return;
      }
    }

    setLoading(true);
    // Hide form as soon as we begin generating with an eligible report
    if (soilReportFile && (soilReportText.length > 50 || soilReportFile.type === "application/pdf")) {
      setFormHidden(true);
    }

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

      // Soil data: If user uploaded a report, tell AI to use ONLY the report
      // Otherwise use generic defaults
      const soilData = soilReportText ? {
        pH: "See uploaded soil report",
        nitrogen: "See uploaded soil report",
        phosphorus: "See uploaded soil report",
        potassium: "See uploaded soil report",
        organicMatter: "See uploaded soil report",
        moisture: "See uploaded soil report"
      } : {
        pH: "Unknown - no soil report uploaded",
        nitrogen: "Unknown - no soil report uploaded",
        phosphorus: "Unknown - no soil report uploaded",
        potassium: "Unknown - no soil report uploaded",
        organicMatter: "Unknown - no soil report uploaded",
        moisture: "Unknown - no soil report uploaded"
      };

      // Fetch real weather data from WeatherAPI
      toast.info("Fetching weather data...");
      const weatherData = await fetchWeatherData(profile.location_lat, profile.location_lon);
      
      if (!weatherData) {
        throw new Error("Failed to fetch weather data");
      }

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
        body: { cropData, soilData, weatherData, location, soilReportText: soilReportText || null }
      });

      if (error) throw error;

      setRecommendation(data);
      toast.success("Recommendation generated!");
    } catch (error: any) {
      console.error("Error getting recommendation:", error);
      toast.error(error.message || "Failed to get recommendation");
      setFormHidden(false);
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

      // Save soil report data to user profile if it was uploaded
      if (recommendation.soilReportSummary) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            soil_report_data: recommendation.soilReportSummary,
            soil_report_date: new Date().toISOString(),
            soil_report_location: fieldName || null
          })
          .eq('id', user.id);

        if (profileError) {
          console.error("Error saving soil report to profile:", profileError);
        } else {
          console.log("Soil report data saved to profile");
        }
      }

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

      toast.success("Crop saved successfully! View your recommendations below.");
      navigate("/my-crops?open=true");
    } catch (error: any) {
      console.error("Error saving crop:", error);
      toast.error(error.message || "Failed to save crop");
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
          Back to Dashboard
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Add Crop</CardTitle>
            <CardDescription>
              Search for your crop and provide details to get AI-powered recommendations
            </CardDescription>
          </CardHeader>
          {!formHidden && (
          <CardContent className="space-y-6">
            {/* Crop Selection */}
            <CropSearch
              selectedCrop={selectedCrop}
              onSelectCrop={setSelectedCrop}
            />

            {/* Soil Report Upload */}
            <div className="space-y-2">
              <Label htmlFor="soilReport">Soil Lab Report (PDF preferred)</Label>
              <Input
                id="soilReport"
                type="file"
                accept="application/pdf,image/*,.txt,.csv"
                onChange={handleSoilReportChange}
              />
              {soilReportFile && (
                <p className="text-xs text-muted-foreground">Selected: {soilReportFile.name}</p>
              )}
            {soilReportText && (
              <div className="rounded-md border bg-success/10 border-success/30 p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-lg">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-success mb-1">
                      Report successfully read! ({soilReportText.length} characters extracted)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      AI will analyze this data when you click "Get AI Recommendation"
                    </p>
                  </div>
                </div>
                
                <div className="rounded bg-background/80 p-3 border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Extracted text preview:</p>
                  <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {soilReportText.slice(0, 200)}{soilReportText.length > 200 ? "..." : ""}
                  </p>
                </div>
                
                {soilReportText.length > 200 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowFullPreview((v) => !v)}
                  >
                    {showFullPreview ? '▲ Hide full text' : '▼ Show full extracted text'}
                  </Button>
                )}
                
                {showFullPreview && (
                  <div className="rounded bg-background/80 p-3 border max-h-96 overflow-auto">
                    <pre className="whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed">
                      {soilReportText}
                    </pre>
                  </div>
                )}
              </div>
            )}
            </div>

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
                    {soilReportText ? "Analyzing Soil Report..." : "Analyzing..."}
                  </>
                ) : (
                  "Get AI Recommendation"
                )}
              </Button>
            </div>
          </CardContent>
          )}
          {formHidden && loading && (
            <CardContent className="space-y-3">
              <div className="p-4 rounded-md border bg-primary/10">
                <div className="flex items-start gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-primary mb-2">
                      AI is analyzing your soil report...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Reading soil lab report ({soilReportText.length} characters) and generating precise recommendations based on actual values...
                    </p>
                    {soilReportText && (
                      <div className="mt-3 p-3 bg-background/80 rounded border text-xs">
                        <p className="text-muted-foreground font-medium mb-1">Report preview:</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {soilReportText.slice(0, 300)}...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Display Recommendation */}
        {recommendation && (
          <>
            <RecommendationDisplay recommendation={recommendation} />
            
            {/* Save Crop Button - Prominent CTA */}
            <Card className="mt-6 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Save This Crop?</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Save this crop with the AI recommendations to your dashboard. 
                      {recommendation.soilReportSummary && " Your soil report data will be saved for future reference."}
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center pt-2">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setRecommendation(null);
                        setFormHidden(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Start Over
                    </Button>
                    <Button
                      onClick={handleSaveCrop}
                      disabled={loading}
                      size="lg"
                      className="text-lg px-8"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Leaf className="w-5 h-5 mr-2" />
                          Save Crop & Recommendations
                        </>
                      )}
                    </Button>
                  </div>
                  {recommendation.soilReportSummary && (
                    <p className="text-xs text-muted-foreground pt-2">
                      ✓ Soil report data will be saved to your profile
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default AddCrop;