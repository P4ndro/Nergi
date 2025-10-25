import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface CropSearchProps {
  selectedCrop: string;
  onSelectCrop: (crop: string) => void;
}

interface CropOption {
  id: string;
  crop_name: string;
  // some rows may store common names as an array or a comma-separated string
  common_names: string[] | string;
}

const CropSearch = ({ selectedCrop, onSelectCrop }: CropSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<CropOption[]>([]);
  const [allCrops, setAllCrops] = useState<CropOption[]>([]);

  useEffect(() => {
    loadCrops();
  }, []);

  // Debounced prefix-filtering: suggest crops that START with the typed prefix
  useEffect(() => {
    const handler = setTimeout(() => {
      const term = searchTerm.trim().toLowerCase();
      if (term.length > 0) {
        const filtered = allCrops.filter((crop) => {
          const nameStarts = crop.crop_name.toLowerCase().startsWith(term);

          let commonStarts = false;
          if (Array.isArray(crop.common_names)) {
            commonStarts = crop.common_names.some((name) => name.toLowerCase().startsWith(term));
          } else if (typeof crop.common_names === "string") {
            commonStarts = crop.common_names.toLowerCase().startsWith(term);
          }

          return nameStarts || commonStarts;
        });

        setSuggestions(filtered.slice(0, 10));
      } else {
        setSuggestions(allCrops.slice(0, 5));
      }
    }, 200); // 200ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm, allCrops]);

  const loadCrops = async () => {
    const { data, error } = await supabase
      .from('crop_database')
      .select('id, crop_name, common_names')
      .order('crop_name');

    if (error) {
      console.error("Error loading crops:", error);
      return;
    }

    setAllCrops(data || []);
    setSuggestions((data || []).slice(0, 5));
  };

  const handleSelectCrop = (cropName: string) => {
    onSelectCrop(cropName);
    setSearchTerm(cropName);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        // prefer exact match, otherwise pick first suggestion
        const exact = suggestions.find((c) => c.crop_name.toLowerCase() === searchTerm.toLowerCase());
        const pick = exact || suggestions[0];
        handleSelectCrop(pick.crop_name);
      }
    }
  };

  const handleBlur = () => {
    // if user typed an exact crop name, select it on blur
    if (searchTerm.trim().length === 0) return;
    const exact = allCrops.find((c) => c.crop_name.toLowerCase() === searchTerm.toLowerCase());
    if (exact) handleSelectCrop(exact.crop_name);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="crop-search">Search Crop</Label>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="crop-search"
          className="pl-9"
          placeholder="Type to search crops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {searchTerm ? "Matching crops:" : "Popular crops:"}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((crop) => (
              <Badge
                key={crop.id}
                variant={selectedCrop === crop.crop_name ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => handleSelectCrop(crop.crop_name)}
              >
                {crop.crop_name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {selectedCrop && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm">
            <span className="font-medium text-primary">Selected:</span> {selectedCrop}
          </p>
        </div>
      )}
    </div>
  );
};

export default CropSearch;