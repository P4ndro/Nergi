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
  common_names: string[];
}

const CropSearch = ({ selectedCrop, onSelectCrop }: CropSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<CropOption[]>([]);
  const [allCrops, setAllCrops] = useState<CropOption[]>([]);

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = allCrops.filter(crop => 
        crop.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.common_names.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions(allCrops.slice(0, 5));
    }
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchTerm.trim().length > 0) {
              onSelectCrop(searchTerm.trim());
            }
          }}
        />
      </div>

      {/* Suggestions */}
      {(searchTerm && searchTerm.trim().length > 0) && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {"Matching crops:"}
          </p>
          <div className="flex flex-wrap gap-2">
            {/* Allow free-text selection */}
            <Badge
              variant={selectedCrop === searchTerm.trim() ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => handleSelectCrop(searchTerm.trim())}
            >
              Use "{searchTerm.trim()}"
            </Badge>
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