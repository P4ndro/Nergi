import { useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, format as formatDate, startOfDay } from "date-fns";
import { useTranslation } from "react-i18next";
import { dateLocale, longDatePattern, shortDatePattern } from "@/i18n";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CATEGORY_STYLES,
  type PlanWeek,
  weekRange,
} from "@/lib/recommendation";

interface PlanCalendarProps {
  weeks: PlanWeek[];
  startDate: Date;
  /** Whether week 1 starts on the planting day (shown in the legend). */
  startsOnPlantingDay?: boolean;
}

const PlanCalendar = ({ weeks, startDate, startsOnPlantingDay = false }: PlanCalendarProps) => {
  const { t } = useTranslation();
  const locale = dateLocale();
  const format = (date: Date, pattern: string) => formatDate(date, pattern, { locale });
  const SHORT = shortDatePattern();
  const LONG = longDatePattern();
  const startLabel = startsOnPlantingDay ? t("plan_planting_day") : t("plan_starts");
  const start = startOfDay(startDate);
  const totalWeeks = weeks.length > 0 ? Math.max(...weeks.map((w) => w.week)) : 0;
  const planEnd = addDays(start, totalWeeks * 7 - 1);

  const today = startOfDay(new Date());
  const initialSelection = today >= start && today <= planEnd ? today : start;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialSelection);
  const [month, setMonth] = useState<Date>(initialSelection);

  const selectedWeekNumber = useMemo(() => {
    if (!selectedDate) return undefined;
    const days = differenceInCalendarDays(startOfDay(selectedDate), start);
    if (days < 0 || days >= totalWeeks * 7) return undefined;
    return Math.floor(days / 7) + 1;
  }, [selectedDate, start, totalWeeks]);

  const selectedWeek = weeks.find((w) => w.week === selectedWeekNumber);

  const selectWeek = (week: number) => {
    const { from } = weekRange(start, week);
    setSelectedDate(from);
    setMonth(from);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="shrink-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={month}
            locale={locale}
            onMonthChange={setMonth}
            className="rounded-md border"
            modifiers={{
              inPlan: { from: start, to: planEnd },
              planStart: start,
            }}
            modifiersClassNames={{
              inPlan: "bg-primary/10",
              planStart: "ring-2 ring-primary ring-inset font-semibold",
            }}
          />
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-primary/10 border border-primary/20" />
              {t("plan_legend")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm ring-2 ring-primary ring-inset" />
              {startLabel} ({format(start, SHORT)})
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 rounded-md border bg-muted/30 p-4" aria-live="polite" data-testid="plan-week-panel">
          {selectedWeek ? (
            <>
              <h3 className="font-semibold">
                {t("plan_week", { n: selectedWeek.week })}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {format(weekRange(start, selectedWeek.week).from, SHORT)} –{" "}
                  {format(weekRange(start, selectedWeek.week).to, LONG)}
                </span>
              </h3>
              {selectedWeek.tasks.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {selectedWeek.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className={cn("shrink-0 font-normal", CATEGORY_STYLES[task.category])}>
                        {t(`cat_${task.category}`)}
                      </Badge>
                      <span className="pt-0.5">{task.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{t("plan_no_tasks")}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {selectedDate ? `${t("plan_outside", { date: format(selectedDate, LONG) })} ` : ""}
              {t("plan_range", { from: format(start, SHORT), to: format(planEnd, LONG) })}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {weeks.map((week) => {
          const { from, to } = weekRange(start, week.week);
          return (
            <button
              key={week.week}
              type="button"
              onClick={() => selectWeek(week.week)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent",
                selectedWeekNumber === week.week && "border-primary bg-primary/10",
              )}
            >
              <span className="font-medium">{t("plan_week", { n: week.week })}</span>
              <span className="ml-1 text-muted-foreground">
                {format(from, SHORT)}–{format(to, SHORT)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlanCalendar;
