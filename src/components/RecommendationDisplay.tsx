import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, Beaker, CloudSun } from "lucide-react";
import PlanCalendar from "@/components/PlanCalendar";
import { parseDateOnly, type Recommendation } from "@/lib/recommendation";

interface RecommendationProps {
  recommendation: Recommendation;
  /** Used for plans saved before planStartDate was stored. */
  fallbackStartDate?: Date;
  startLabel?: string;
}

const SOIL_LABELS: Record<string, string> = {
  pH: "pH",
  EC: "EC (dS/m)",
  OM_percent: "Organic matter (%)",
  N_ppm: "Nitrogen (ppm)",
  P_ppm: "Phosphorus (ppm)",
  K_ppm: "Potassium (ppm)",
  CEC: "CEC",
  Fe_ppm: "Iron (ppm)",
  Zn_ppm: "Zinc (ppm)",
  Mn_ppm: "Manganese (ppm)",
  Cu_ppm: "Copper (ppm)",
  B_ppm: "Boron (ppm)",
};

const RecommendationDisplay = ({ recommendation, fallbackStartDate, startLabel }: RecommendationProps) => {
  const planStart = parseDateOnly(recommendation.planStartDate) ?? fallbackStartDate ?? new Date();
  const soilEntries = recommendation.soilReportSummary
    ? Object.entries(recommendation.soilReportSummary).filter(
        ([key, value]) => key !== "notes" && value !== null && value !== undefined,
      )
    : [];

  const getVerdictIcon = () => {
    switch (recommendation.verdict) {
      case "Plantable":
        return <CheckCircle className="w-6 h-6 text-success" />;
      case "Caution":
        return <AlertTriangle className="w-6 h-6 text-warning" />;
      case "Not recommended":
        return <XCircle className="w-6 h-6 text-destructive" />;
    }
  };

  const getVerdictColor = () => {
    switch (recommendation.verdict) {
      case "Plantable":
        return "bg-success/10 border-success/30";
      case "Caution":
        return "bg-warning/10 border-warning/30";
      case "Not recommended":
        return "bg-destructive/10 border-destructive/30";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low":
        return "text-success";
      case "Moderate":
        return "text-warning";
      case "High":
        return "text-destructive";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {recommendation.weatherIsEstimate && (
        <Alert className="border-warning/40 bg-warning/5">
          <CloudSun className="h-4 w-4" />
          <AlertDescription>
            Live weather was not available, so this recommendation used general seasonal estimates. Set your
            location on the dashboard for advice based on your local forecast.
          </AlertDescription>
        </Alert>
      )}

      {soilEntries.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-primary" />
              Your Soil Report
            </CardTitle>
            <CardDescription>Values read from the report you uploaded</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {soilEntries.map(([key, value]) => (
                <div key={key} className="p-3 rounded border bg-muted/40">
                  <p className="text-xs text-muted-foreground mb-1">{SOIL_LABELS[key] ?? key}</p>
                  <p className="font-bold text-foreground">{String(value)}</p>
                </div>
              ))}
            </div>
            {recommendation.soilReportSummary?.notes && (
              <p className="mt-4 text-sm text-muted-foreground border-l-4 border-primary pl-3">
                {recommendation.soilReportSummary.notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ==== CROP RECOMMENDATIONS BELOW ==== */}
      {/* Verdict */}
      <Card className={getVerdictColor()}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getVerdictIcon()}
            {recommendation.verdict}
          </CardTitle>
          <CardDescription className="text-foreground/90">
            {recommendation.summary}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Key Actions</CardTitle>
          <CardDescription>Most important steps to take</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {recommendation.actions.map((action, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <p className="text-sm flex-1">{action}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Soil Amendments */}
      {recommendation.soilAmendments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5" />
              Soil Amendments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendation.soilAmendments.map((amendment, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-sm">{amendment}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {recommendation.calendar.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>4-Week Plan</CardTitle>
            <CardDescription>Pick a date or a week to see what to do.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlanCalendar weeks={recommendation.calendar} startDate={planStart} startLabel={startLabel} />
          </CardContent>
        </Card>
      )}

      {/* Risks */}
      {recommendation.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>Potential threats and mitigation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendation.risks.map((risk, idx) => (
              <Alert key={idx}>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                      <span className="font-semibold capitalize">{risk.type} Risk</span>
                    </div>
                    <p className="text-sm">{risk.description}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Mitigation:</span> {risk.mitigation}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Data Sources */}
      {recommendation.usedFields && recommendation.usedFields.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Data sources used:</span>{" "}
              {recommendation.usedFields.join(", ")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecommendationDisplay;