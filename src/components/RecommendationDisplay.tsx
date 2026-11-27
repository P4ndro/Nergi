import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, Beaker, CloudSun, Info } from "lucide-react";
import PlanCalendar from "@/components/PlanCalendar";
import { parseDateOnly, type Recommendation } from "@/lib/recommendation";

interface RecommendationProps {
  recommendation: Recommendation;
  /** Used for plans saved before planStartDate was stored. */
  fallbackStartDate?: Date;
  startsOnPlantingDay?: boolean;
}

const VERDICT_STYLE = {
  Plantable: { icon: <CheckCircle className="w-6 h-6 text-success" />, card: "bg-success/10 border-success/30" },
  Caution: { icon: <AlertTriangle className="w-6 h-6 text-warning" />, card: "bg-warning/10 border-warning/30" },
  "Not recommended": { icon: <XCircle className="w-6 h-6 text-destructive" />, card: "bg-destructive/10 border-destructive/30" },
} as const;

const SEVERITY_STYLE = {
  Low: "text-success",
  Moderate: "text-warning",
  High: "text-destructive",
} as const;

const RecommendationDisplay = ({ recommendation, fallbackStartDate, startsOnPlantingDay }: RecommendationProps) => {
  const { t } = useTranslation();
  const planStart = parseDateOnly(recommendation.planStartDate) ?? fallbackStartDate ?? new Date();
  const verdictStyle = VERDICT_STYLE[recommendation.verdict];
  const soilEntries = recommendation.soilReportSummary
    ? Object.entries(recommendation.soilReportSummary).filter(
        ([key, value]) => key !== "notes" && value !== null && value !== undefined,
      )
    : [];

  return (
    <div className="mt-6 space-y-6">
      {recommendation.weatherIsEstimate && (
        <Alert className="border-warning/40 bg-warning/5">
          <CloudSun className="h-4 w-4" />
          <AlertDescription>{t("rec_weather_estimate")}</AlertDescription>
        </Alert>
      )}

      {soilEntries.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-primary" />
              {t("rec_soil_title")}
            </CardTitle>
            <CardDescription>{t("rec_soil_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {soilEntries.map(([key, value]) => (
                <div key={key} className="p-3 rounded border bg-muted/40">
                  <p className="text-xs text-muted-foreground mb-1">{t(`soil_${key}`, { defaultValue: key })}</p>
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

      {/* Verdict */}
      <Card className={verdictStyle.card}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {verdictStyle.icon}
            {t(`verdict_${recommendation.verdict}`)}
          </CardTitle>
          <CardDescription className="text-foreground/90 leading-relaxed">
            {recommendation.summary}
          </CardDescription>
        </CardHeader>
      </Card>

      {recommendation.actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("rec_actions")}</CardTitle>
            <CardDescription>{t("rec_actions_desc")}</CardDescription>
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
      )}

      {recommendation.soilAmendments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5" />
              {t("rec_amendments")}
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
            <CardTitle>{t("rec_plan")}</CardTitle>
            <CardDescription>{t("rec_plan_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <PlanCalendar
              weeks={recommendation.calendar}
              startDate={planStart}
              startsOnPlantingDay={startsOnPlantingDay}
            />
          </CardContent>
        </Card>
      )}

      {recommendation.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("rec_risks")}</CardTitle>
            <CardDescription>{t("rec_risks_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendation.risks.map((risk, idx) => (
              <Alert key={idx}>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={SEVERITY_STYLE[risk.severity]}>
                        {t(`severity_${risk.severity}`)}
                      </Badge>
                      <span className="font-semibold">{risk.type}</span>
                    </div>
                    <p className="text-sm">{risk.description}</p>
                    {risk.mitigation && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{t("rec_mitigation")}</span> {risk.mitigation}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-start gap-2 rounded-md border bg-muted/50 p-4 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-1">
          <p>{t("rec_disclaimer")}</p>
          {recommendation.usedFields && recommendation.usedFields.length > 0 && (
            <p>
              <span className="font-medium">{t("rec_sources")}</span> {recommendation.usedFields.join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationDisplay;
