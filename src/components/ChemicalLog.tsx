import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { FlaskConical, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dateLocale, longDatePattern } from "@/i18n";
import { parseDateOnly, toDateOnly } from "@/lib/recommendation";

interface ChemicalRecord {
  id: string;
  chemical_name: string;
  application_date: string;
  reason: string | null;
}

/** Lists and records chemical applications for one crop. */
const ChemicalLog = ({ cropId }: { cropId: string }) => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<ChemicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(toDateOnly(new Date()));
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("chemical_applications")
      .select("id, chemical_name, application_date, reason")
      .eq("crop_id", cropId)
      .order("application_date", { ascending: false });
    if (error) console.error("Error loading chemical log:", error);
    setRecords(data ?? []);
    setLoading(false);
  }, [cropId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !date) {
      toast.error(t("t_chem"));
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("chemical_applications").insert({
        user_id: user.id,
        crop_id: cropId,
        chemical_name: name.trim(),
        application_date: date,
        reason: reason.trim() || null,
      });
      if (error) throw error;
      toast.success(t("mc_chem_saved"));
      setName("");
      setReason("");
      setAdding(false);
      await load();
    } catch (error) {
      console.error("Error saving chemical record:", error);
      toast.error(t("mc_chem_failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FlaskConical className="w-5 h-5" />
          {t("mc_chem_title")}
        </CardTitle>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />
            {t("mc_chem_add")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {adding && (
          <form onSubmit={handleSubmit} className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="chem-log-name">{t("ac_chem_name")}</Label>
              <Input id="chem-log-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("ac_chem_name_ph")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="chem-log-date">{t("ac_chem_date")}</Label>
              <Input id="chem-log-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="chem-log-reason">{t("mc_chem_reason")}</Label>
              <Input id="chem-log-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setAdding(false)} disabled={saving}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t("mc_chem_add")}
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("mc_chem_empty")}</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {records.map((record) => (
              <li key={record.id} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2 text-sm">
                <span className="font-medium">{record.chemical_name}</span>
                <span className="text-muted-foreground">
                  {format(parseDateOnly(record.application_date) ?? new Date(record.application_date), longDatePattern(), { locale: dateLocale() })}
                  {record.reason ? ` · ${record.reason}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ChemicalLog;
