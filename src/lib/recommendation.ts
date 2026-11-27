import { addDays, format, isValid, parseISO, startOfDay } from "date-fns";

export const TASK_CATEGORIES = [
  "soil",
  "planting",
  "watering",
  "fertilizing",
  "monitoring",
  "protection",
  "harvest",
  "other",
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export interface PlanTask {
  text: string;
  category: TaskCategory;
}

export interface PlanWeek {
  week: number;
  tasks: PlanTask[];
}

export interface Risk {
  type: string;
  severity: "Low" | "Moderate" | "High";
  description: string;
  mitigation: string;
}

export interface SoilReportSummary {
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
}

export type Verdict = "Plantable" | "Caution" | "Not recommended";

export interface Recommendation {
  verdict: Verdict;
  summary: string;
  actions: string[];
  soilAmendments: string[];
  calendar: PlanWeek[];
  risks: Risk[];
  soilReportSummary: SoilReportSummary | null;
  usedFields?: string[];
  /** First day of week 1, as YYYY-MM-DD. Missing on recommendations saved before this field existed. */
  planStartDate?: string;
  /** True when the weather used for this recommendation was an estimate, not a live forecast. */
  weatherIsEstimate?: boolean;
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  soil: "Soil prep",
  planting: "Planting",
  watering: "Watering",
  fertilizing: "Fertilizing",
  monitoring: "Monitoring",
  protection: "Pest & disease",
  harvest: "Harvest",
  other: "Other",
};

export const CATEGORY_STYLES: Record<TaskCategory, string> = {
  soil: "bg-amber-100 text-amber-900 border-amber-200",
  planting: "bg-emerald-100 text-emerald-900 border-emerald-200",
  watering: "bg-sky-100 text-sky-900 border-sky-200",
  fertilizing: "bg-lime-100 text-lime-900 border-lime-200",
  monitoring: "bg-slate-100 text-slate-900 border-slate-200",
  protection: "bg-rose-100 text-rose-900 border-rose-200",
  harvest: "bg-orange-100 text-orange-900 border-orange-200",
  other: "bg-muted text-foreground border-border",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCategory(value: unknown): value is TaskCategory {
  return typeof value === "string" && (TASK_CATEGORIES as readonly string[]).includes(value);
}

/** Accepts both the current task format ({text, category}) and older saved plans (plain strings). */
export function normalizeTasks(tasks: unknown): PlanTask[] {
  if (!Array.isArray(tasks)) return [];
  return tasks.flatMap((task): PlanTask[] => {
    if (typeof task === "string") {
      return task.trim() ? [{ text: task.trim(), category: "other" }] : [];
    }
    if (isRecord(task) && typeof task.text === "string" && task.text.trim()) {
      return [{ text: task.text.trim(), category: isCategory(task.category) ? task.category : "other" }];
    }
    return [];
  });
}

export function normalizeCalendar(calendar: unknown): PlanWeek[] {
  if (!Array.isArray(calendar)) return [];
  return calendar
    .filter(isRecord)
    .map((week, index) => ({
      week: Number(week.week) || index + 1,
      tasks: normalizeTasks(week.tasks),
    }))
    .sort((a, b) => a.week - b.week);
}

/** Turns stored JSON (possibly from an older version of the app) into a Recommendation, or null if unusable. */
export function parseStoredRecommendation(value: unknown): Recommendation | null {
  if (!isRecord(value) || typeof value.summary !== "string") return null;
  const verdict: Verdict =
    value.verdict === "Plantable" || value.verdict === "Not recommended" ? value.verdict : "Caution";
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);
  const risks = Array.isArray(value.risks)
    ? value.risks.filter(isRecord).map((risk) => ({
        type: String(risk.type ?? "General"),
        severity: (risk.severity === "Low" || risk.severity === "High" ? risk.severity : "Moderate") as Risk["severity"],
        description: String(risk.description ?? ""),
        mitigation: String(risk.mitigation ?? ""),
      }))
    : [];
  return {
    verdict,
    summary: value.summary,
    actions: strings(value.actions),
    soilAmendments: strings(value.soilAmendments),
    calendar: normalizeCalendar(value.calendar),
    risks,
    soilReportSummary: isRecord(value.soilReportSummary) ? (value.soilReportSummary as SoilReportSummary) : null,
    usedFields: strings(value.usedFields),
    planStartDate: typeof value.planStartDate === "string" ? value.planStartDate : undefined,
    weatherIsEstimate: value.weatherIsEstimate === true,
  };
}

/** Parses a YYYY-MM-DD string as a local calendar date (not UTC midnight). */
export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? startOfDay(date) : null;
}

export function toDateOnly(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Week 1 of the plan starts on the planned planting date if that is in the future.
 * For crops already in the ground (or a planned date that has passed), the plan covers the next four weeks from today.
 */
export function computePlanStartDate(
  status: "planned" | "planted",
  plannedDate: string,
  today: Date = new Date(),
): string {
  const todayStart = startOfDay(today);
  if (status === "planned") {
    const planned = parseDateOnly(plannedDate);
    if (planned && planned > todayStart) return toDateOnly(planned);
  }
  return toDateOnly(todayStart);
}

export function weekRange(start: Date, week: number): { from: Date; to: Date } {
  const from = addDays(start, (week - 1) * 7);
  return { from, to: addDays(from, 6) };
}
