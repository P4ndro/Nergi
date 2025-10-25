import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, Beaker } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useMemo } from "react";
import { addDays } from "date-fns";

interface Risk {
  type: string;
  severity: "Low" | "Moderate" | "High";
  description: string;
  mitigation: string;
}

interface CalendarWeek {
  week: number;
  tasks: string[];
}

interface RecommendationProps {
  recommendation: {
    verdict: "Plantable" | "Caution" | "Not recommended";
    summary: string;
    actions: string[];
    calendar: CalendarWeek[];
    risks: Risk[];
    soilAmendments?: string[];
    usedFields?: string[];
    soilReportSummary?: {
      pH?: number | null;
      EC?: number | null;
      OM_percent?: number | null;
      N_ppm?: number | null;
      P_ppm?: number | null;
      K_ppm?: number | null;
      CEC?: number | null;
      Fe_ppm?: number | null;
      Zn_ppm?: number | null;
      Mn_ppm?: number | null;
      Cu_ppm?: number | null;
      B_ppm?: number | null;
      notes?: string | null;
    } | null;
    soilReportHuman?: string | null;
    soilReportDetails?: Array<{
      name: string;
      value: number | string | null;
      unit?: string | null;
      optimalRange?: string | null;
      comparison?: string | null;
      explanation?: string | null;
    }> | null;
    soilReportRawExcerpt?: string | null;
  };
}

const RecommendationDisplay = ({ recommendation }: RecommendationProps) => {
  // Get medicine dates from the calendar
  const medicineDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    
    if (recommendation.calendar && recommendation.calendar.length > 0) {
      recommendation.calendar.forEach((week) => {
        week.tasks.forEach((task) => {
          // Check if task involves medicine, pesticide, or spray
          const lowerTask = task.toLowerCase();
          if (
            lowerTask.includes("spray") ||
            lowerTask.includes("pesticide") ||
            lowerTask.includes("fungicide") ||
            lowerTask.includes("medicine") ||
            lowerTask.includes("apply") ||
            lowerTask.includes("chemical")
          ) {
            // Calculate approximate date: week 1 = +7 days, week 2 = +14 days, etc.
            const daysToAdd = (week.week - 1) * 7 + 3; // Mid-week
            dates.push(addDays(today, daysToAdd));
          }
        });
      });
    }
    
    return dates;
  }, [recommendation.calendar]);

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
      {/* ==== SOIL REPORT ANALYSIS FIRST ==== */}
      {recommendation.soilReportHuman && (
        <>
          {/* Main Header for Soil Analysis Section */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Beaker className="w-6 h-6 text-primary" />
                Your Soil Report Analysis
              </CardTitle>
              <CardDescription className="text-base">
                AI has read your lab report and extracted all the important details below
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Human-Readable Summary */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Overall Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-7 text-foreground">{recommendation.soilReportHuman}</p>
            </CardContent>
          </Card>

          {/* Detailed Parameter-by-Parameter Breakdown */}
          {recommendation.soilReportDetails && recommendation.soilReportDetails.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔬 Detailed Analysis - Every Parameter Explained
                </CardTitle>
                <CardDescription>
                  What each value in your soil report means for your crops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendation.soilReportDetails.map((row, idx) => (
                    <div key={idx} className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-foreground">{row.name}</h4>
                          {row.optimalRange && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Optimal range: {row.optimalRange}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-primary">
                            {row.value}
                            {row.unit && <span className="text-base font-normal text-muted-foreground ml-1">{row.unit}</span>}
                          </div>
                          {row.comparison && (
                            <p className="text-xs text-muted-foreground mt-1">{row.comparison}</p>
                          )}
                        </div>
                      </div>
                      {row.explanation && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm leading-6 text-foreground/80">
                            {row.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Reference Summary Grid */}
          {recommendation.soilReportSummary && (
            <Card className="border-muted">
              <CardHeader>
                <CardTitle className="text-base">Quick Reference - All Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(recommendation.soilReportSummary).map(([k, v]) =>
                    v !== null && v !== undefined && k !== 'notes' ? (
                      <div key={k} className="p-3 rounded border bg-muted/40">
                        <p className="text-xs text-muted-foreground mb-1">{k.replace(/_/g, ' ')}</p>
                        <p className="font-bold text-foreground">{String(v)}</p>
                      </div>
                    ) : null
                  )}
                </div>
                {recommendation.soilReportSummary.notes && (
                  <div className="mt-4 p-3 rounded bg-muted/30 border-l-4 border-primary">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Technical Notes:</p>
                    <p className="text-xs text-muted-foreground">{recommendation.soilReportSummary.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Raw Report Excerpt */}
          {recommendation.soilReportRawExcerpt && (
            <Card className="border-muted">
              <CardHeader>
                <CardTitle className="text-base">Original Report Text</CardTitle>
                <CardDescription>Raw data from your uploaded file</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground border rounded p-3 bg-muted/20 font-mono">
                  {recommendation.soilReportRawExcerpt}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Divider before recommendations */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-primary/20"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm font-medium text-muted-foreground">
                📋 Based on this soil analysis, here are your crop recommendations
              </span>
            </div>
          </div>
        </>
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
          <CardTitle>Top 3 Actions</CardTitle>
          <CardDescription>Immediate steps to take</CardDescription>
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
      {recommendation.soilAmendments && recommendation.soilAmendments.length > 0 && (
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

      {/* Calendar with Medicine Dates */}
      {recommendation.calendar && recommendation.calendar.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Task Calendar</CardTitle>
            <CardDescription>
              Green dates indicate medicine/pesticide application days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span>Medicine/Pesticide Application Dates</span>
              </div>
              
              <Calendar
                mode="single"
                className="rounded-md border"
                classNames={{
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                }}
                modifiers={{
                  medicineDays: medicineDates,
                }}
                modifiersClassNames={{
                  medicineDays: "bg-green-500 text-white hover:bg-green-600 focus:bg-green-600",
                }}
              />

              {/* Task List by Week */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-sm">Upcoming Tasks by Week</h3>
                {recommendation.calendar.map((week) => (
                  <div key={week.week} className="border-l-2 border-primary pl-4">
                    <p className="font-semibold mb-2">Week {week.week}</p>
                    <ul className="space-y-1">
                      {week.tasks.map((task, idx) => {
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risks */}
      {recommendation.risks && recommendation.risks.length > 0 && (
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