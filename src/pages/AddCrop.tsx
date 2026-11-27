import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { currentLanguage } from "@/i18n";
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
import { fetchWeatherData, getMockWeatherData, type WeatherData } from "@/lib/weather-api";
import { computePlanStartDate, parseStoredRecommendation, type Recommendation } from "@/lib/recommendation";

// pdf.js is large, so it's only loaded when someone actually uploads a PDF.
async function extractPdfText(file: File): Promise<string> {
  const [pdfjsLib, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  let text = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    text += `\n\n[Page ${pageNum}]\n` + pageText;
  }
  return text;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

const AddCrop = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  // A recommendation only applies to the details it was generated for.
  useEffect(() => {
    setRecommendation(null);
  }, [selectedCrop, status, plantingDate, plannedDate, plantingMethod]);

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
        const text = await extractPdfText(file);
        const trimmed = text.slice(0, 100000);
        setSoilReportText(trimmed);
        if (trimmed.length > 0) toast.success(t("t_pdf_ok"));
        return;
      }

      // Parse text/CSV
      const isTextLike = file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".csv") || file.name.toLowerCase().endsWith(".txt");
      if (isTextLike) {
        const text = await file.text();
        const trimmed = text.slice(0, 100000);
        setSoilReportText(trimmed);
        if (trimmed.length > 0) toast.success(t("t_text_ok"));
        return;
      }

      // OCR for screenshots/images (basic EN). Add KA by changing lang below
      if (file.type.startsWith("image/")) {
        toast.message(t("t_ocr_running"));
        const pre = await preprocessImageForOCR(file);
        const Tesseract = await import("tesseract.js");
        const { data } = await Tesseract.default.recognize(pre, "eng+kat");
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
          toast.success(t("t_ocr_ok"));
        } else {
          toast.error(t("t_ocr_failed"));
        }
        return;
      }
    } catch (err) {
      console.error("Failed to read soil report:", err);
      toast.error(t("t_read_failed"));
    }
  };

  const handleGetRecommendation = async () => {
    if (!selectedCrop) {
      toast.error(t("t_select_crop"));
      return;
    }

    if (status === "planned" && !plannedDate) {
      toast.error(t("t_planned_date"));
      return;
    }

    if (status === "planted" && !plantingDate) {
      toast.error(t("t_planting_date"));
      return;
    }

    const area = parseFloat(areaValue);
    if (!Number.isFinite(area) || area <= 0) {
      toast.error(t("t_area"));
      return;
    }

    if (chemicalUse === "yes" && (!chemicalName.trim() || !chemicalDate)) {
      toast.error(t("t_chem"));
      return;
    }

    // Basic eligibility check for report (optional but recommended)
    if (soilReportFile) {
      const allowed = ["application/pdf", "text/plain", "text/csv"]; // images are read with OCR
      const isAllowed = allowed.includes(soilReportFile.type) || soilReportFile.type.startsWith("image/");
      if (!isAllowed) {
        toast.error(t("t_file_type"));
        return;
      }
      if (soilReportFile.size > 10 * 1024 * 1024) {
        toast.error(t("t_file_size"));
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
        .maybeSingle();

      if (!profile) throw new Error(t("t_profile"));

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
      const hasLocation = profile.location_lat != null && profile.location_lon != null;
      let weatherData: WeatherData;
      if (hasLocation) {
        toast.info(t("t_fetching_weather"));
        weatherData = await fetchWeatherData(profile.location_lat, profile.location_lon);
        if (weatherData.isEstimate) {
          toast.warning(t("t_weather_estimate"));
        }
      } else {
        toast.info(t("t_no_location"));
        weatherData = getMockWeatherData();
      }
      const cropData = {
        cropName: selectedCrop,
        variety,
        status,
        plantingDate,
        plannedDate,
        areaValue: area,
        areaUnit,
        plantingMethod,
        chemicalUse: chemicalUse === "yes",
        chemicalName: chemicalUse === "yes" ? chemicalName : undefined,
        chemicalDate: chemicalUse === "yes" ? chemicalDate : undefined
      };

      const location = hasLocation ? {
        lat: profile.location_lat,
        lon: profile.location_lon,
        region: profile.location_region
      } : null;

      // Call edge function for recommendation
      const { data, error } = await supabase.functions.invoke('crop-recommendation', {
        body: {
          cropData,
          soilData,
          weatherData,
          location,
          soilReportText: soilReportText || null,
          planStartDate: computePlanStartDate(status, plannedDate),
          language: currentLanguage(),
        }
      });

      if (error) {
        const context = "context" in error ? error.context : null;
        if (context instanceof Response) {
          const errorBody: unknown = await context.clone().json().catch(() => null);
          const functionMessage =
            typeof errorBody === "object" && errorBody !== null && "error" in errorBody
              ? errorBody.error
              : undefined;
          if (typeof functionMessage === "string" && functionMessage) {
            throw new Error(functionMessage);
          }
        }
        throw error;
      }

      const parsed = parseStoredRecommendation(data);
      if (!parsed) throw new Error(t("t_bad_response"));
      setRecommendation(parsed);
      toast.success(t("t_rec_ok"));
    } catch (error) {
      console.error("Error getting recommendation:", error);
      toast.error(errorMessage(error, t("t_rec_failed")));
      setFormHidden(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCrop = async () => {
    if (!selectedCrop || !recommendation) {
      toast.error(t("t_need_rec"));
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
          recommendations: JSON.parse(JSON.stringify(recommendation)),
        })
        .select()
        .single();

      if (cropError) throw cropError;

      // Save soil report data to user profile if it was uploaded
      if (recommendation.soilReportSummary) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            soil_report_data: JSON.parse(JSON.stringify(recommendation.soilReportSummary)),
            soil_report_date: new Date().toISOString(),
            soil_report_location: fieldName || null
          })
          .eq('id', user.id);

        if (profileError) {
          console.error("Error saving soil report to profile:", profileError);
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

        if (chemError) {
          console.error("Error saving chemical:", chemError);
          toast.warning(t("t_chem_not_saved"));
        }
      }

      toast.success(t("t_saved"));
      navigate("/my-crops?open=true");
    } catch (error) {
      console.error("Error saving crop:", error);
      toast.error(errorMessage(error, t("t_save_failed")));
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
          {t("ac_back")}
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{t("ac_title")}</CardTitle>
            <CardDescription>
              {t("ac_desc")}
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
              <Label htmlFor="soilReport">{t("ac_soil_label")}</Label>
              <Input
                id="soilReport"
                type="file"
                accept="application/pdf,image/*,.txt,.csv"
                onChange={handleSoilReportChange}
              />
              {soilReportFile && (
                <p className="text-xs text-muted-foreground">{t("ac_soil_selected", { name: soilReportFile.name })}</p>
              )}
            {soilReportText && (
              <div className="rounded-md border bg-success/10 border-success/30 p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-lg">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-success mb-1">
                      {t("ac_soil_read", { count: soilReportText.length })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("ac_soil_read_hint")}
                    </p>
                  </div>
                </div>
                
                <div className="rounded bg-background/80 p-3 border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t("ac_soil_preview")}</p>
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
                    {showFullPreview ? `▲ ${t("ac_soil_hide")}` : `▼ ${t("ac_soil_show")}`}
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
              <Label htmlFor="variety">{t("ac_variety")}</Label>
              <Input
                id="variety"
                placeholder={t("ac_variety_ph")}
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>{t("ac_status")}</Label>
              <RadioGroup value={status} onValueChange={(v) => setStatus(v as "planned" | "planted")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="planned" id="planned" />
                  <Label htmlFor="planned" className="font-normal cursor-pointer">
                    {t("ac_status_planned")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="planted" id="planted" />
                  <Label htmlFor="planted" className="font-normal cursor-pointer">
                    {t("ac_status_planted")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Dates */}
            {status === "planned" ? (
              <div className="space-y-2">
                <Label htmlFor="plannedDate">{t("ac_planned_date")}</Label>
                <Input
                  id="plannedDate"
                  type="date"
                  value={plannedDate}
                  onChange={(e) => setPlannedDate(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="plantingDate">{t("ac_planting_date")}</Label>
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
                <Label htmlFor="area">{t("ac_area")}</Label>
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
                <Label htmlFor="unit">{t("ac_unit")}</Label>
                <Select value={areaUnit} onValueChange={(v) => setAreaUnit(v as "m2" | "ha")}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m2">{t("ac_unit_m2")}</SelectItem>
                    <SelectItem value="ha">{t("ac_unit_ha")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Planting Method */}
            <div className="space-y-2">
              <Label htmlFor="method">{t("ac_method")}</Label>
              <Select value={plantingMethod} onValueChange={(v) => setPlantingMethod(v as "direct_seed" | "transplant")}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_seed">{t("ac_method_direct_seed")}</SelectItem>
                  <SelectItem value="transplant">{t("ac_method_transplant")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Field Name */}
            <div className="space-y-2">
              <Label htmlFor="fieldName">{t("ac_field")}</Label>
              <Input
                id="fieldName"
                placeholder={t("ac_field_ph")}
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
              />
            </div>

            {/* Chemical Use */}
            <div className="space-y-2">
              <Label>{t("ac_chem")}</Label>
              <RadioGroup value={chemicalUse} onValueChange={(v) => setChemicalUse(v as "yes" | "no")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="chem-no" />
                  <Label htmlFor="chem-no" className="font-normal cursor-pointer">
                    {t("ac_no")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="chem-yes" />
                  <Label htmlFor="chem-yes" className="font-normal cursor-pointer">
                    {t("ac_yes")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {chemicalUse === "yes" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="chemName">{t("ac_chem_name")}</Label>
                  <Input
                    id="chemName"
                    placeholder={t("ac_chem_name_ph")}
                    value={chemicalName}
                    onChange={(e) => setChemicalName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chemDate">{t("ac_chem_date")}</Label>
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
              <Label htmlFor="notes">{t("ac_notes")}</Label>
              <Textarea
                id="notes"
                placeholder={t("ac_notes_ph")}
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
                    {soilReportText ? t("ac_analyzing_report") : t("ac_analyzing")}
                  </>
                ) : (
                  t("ac_get")
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("ac_privacy")}
            </p>
          </CardContent>
          )}
          {formHidden && loading && (
            <CardContent className="space-y-3">
              <div className="p-4 rounded-md border bg-primary/10">
                <div className="flex items-start gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-primary mb-2">
                      {t("ac_ai_reading")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("ac_ai_reading_body", { count: soilReportText.length })}
                    </p>
                    {soilReportText && (
                      <div className="mt-3 p-3 bg-background/80 rounded border text-xs">
                        <p className="text-muted-foreground font-medium mb-1">{t("ac_report_preview")}</p>
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
            <RecommendationDisplay
              recommendation={recommendation}
              startsOnPlantingDay={status === "planned" && recommendation.planStartDate === plannedDate}
            />
            
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
                    <h3 className="text-2xl font-bold mb-2">{t("ac_save_title")}</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {t("ac_save_body")}
                      {recommendation.soilReportSummary && ` ${t("ac_save_body_soil")}`}
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
                      {t("ac_start_over")}
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
                          {t("ac_saving")}
                        </>
                      ) : (
                        <>
                          <Leaf className="w-5 h-5 mr-2" />
                          {t("ac_save")}
                        </>
                      )}
                    </Button>
                  </div>
                  {recommendation.soilReportSummary && (
                    <p className="text-xs text-muted-foreground pt-2">
                      {t("ac_soil_saved_note")}
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