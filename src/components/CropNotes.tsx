import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CropNotesProps {
  cropId: string;
  initialNotes: string | null;
  onSaved: (notes: string | null) => void;
}

/** Lets the user edit the free-text notes on a saved crop. */
const CropNotes = ({ cropId, initialNotes, onSaved }: CropNotesProps) => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const changed = notes.trim() !== (initialNotes ?? "").trim();

  const handleSave = async () => {
    setSaving(true);
    const value = notes.trim() || null;
    try {
      const { error } = await supabase.from("user_crops").update({ notes: value }).eq("id", cropId);
      if (error) throw error;
      onSaved(value);
      toast.success(t("mc_notes_saved"));
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error(t("mc_notes_failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`crop-notes-${cropId}`}>{t("mc_notes")}</Label>
      <Textarea
        id={`crop-notes-${cropId}`}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t("mc_notes_ph")}
        rows={3}
        maxLength={2000}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={!changed || saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {t("mc_notes_save")}
        </Button>
      </div>
    </div>
  );
};

export default CropNotes;
