import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, FileText, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { uploadAndExtractFile } from "@/lib/file-upload";

interface Profile {
  id: string;
  name: string | null;
  location_lat: number | null;
  location_lon: number | null;
  location_region: string | null;
  soil_analysis_text: string | null;
  soil_analysis_file_name: string | null;
  soil_analysis_uploaded_at: string | null;
}

interface SoilReport {
  id: string;
  location: string | null;
  sampled_at: string | null;
  crop: string | null;
  ph: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  organic_matter: number | null;
  electrical_conductivity: number | null;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [soilReports, setSoilReports] = useState<SoilReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setName(data.name || "");
      
      // Load soil reports
      const { data: reports, error: reportsError } = await supabase
        .from('soil_reports' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!reportsError && reports) {
        setSoilReports(reports as SoilReport[]);
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadedFile(file);
    
    try {
      // Simulate progress
      setUploadProgress(20);
      
      // Parse PDF using Edge Function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('location', profile?.location_region || 'Unknown');
      formData.append('crop', ''); // Can be set from user input later
      
      const { data: parseResult, error: parseError } = await supabase.functions.invoke(
        'parse-soil-pdf',
        {
          body: formData
        }
      );
      
      if (parseError) throw parseError;
      
      setUploadProgress(60);
      
      // Save to soil_reports table
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { error: dbError } = await supabase
        .from('soil_reports' as any)
        .insert({
          user_id: user.id,
          location: profile?.location_region || 'Unknown',
          crop: null,
          pdf_text: parseResult.pdf_text,
          ph: parseResult.parsed.ph,
          nitrogen: parseResult.parsed.nitrogen,
          phosphorus: parseResult.parsed.phosphorus,
          potassium: parseResult.parsed.potassium,
          organic_matter: parseResult.parsed.organic_matter,
          electrical_conductivity: parseResult.parsed.electrical_conductivity
        });
      
      setUploadProgress(100);
      
      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(`Failed to save to database: ${dbError.message}`);
      }
      
      toast.success(`Soil analysis uploaded and parsed successfully!`);
      loadProfile(); // Reload profile to show updated data
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload soil analysis");
      setUploadedFile(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveSoilAnalysis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from('profiles')
        .update({
          soil_analysis_text: null,
          soil_analysis_file_name: null,
          soil_analysis_uploaded_at: null
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success("Soil analysis removed");
      loadProfile();
    } catch (error: any) {
      toast.error("Failed to remove soil analysis");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={async () => {
                    if (name && name !== profile?.name) {
                      const { error } = await supabase
                        .from('profiles')
                        .update({ name })
                        .eq('id', profile?.id);
                      if (!error) {
                        toast.success("Name updated");
                        loadProfile();
                      }
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Location</Label>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{profile?.location_region || "Not set"}</span>
                  {profile?.location_lat && profile?.location_lon && (
                    <span className="text-muted-foreground">
                      ({profile.location_lat.toFixed(4)}, {profile.location_lon.toFixed(4)})
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Soil Analysis Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Soil Analysis Report</CardTitle>
              <CardDescription>
                Upload your soil analysis PDF to get more accurate crop recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Soil Analysis */}
              {profile?.soil_analysis_text ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{profile.soil_analysis_file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(profile.soil_analysis_uploaded_at!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveSoilAnalysis}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg max-h-40 overflow-y-auto">
                    <p className="text-xs text-muted-foreground mb-2">Extracted text preview:</p>
                    <p className="text-xs">{profile.soil_analysis_text.substring(0, 500)}...</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ✓ This soil analysis will be used for all your crop recommendations
                  </p>
                </div>
              ) : (
                <>
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{uploadedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(uploadedFile.size / 1024).toFixed(2)} KB
                            )</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setUploadedFile(null)}
                          disabled={uploading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {uploading && (
                        <div className="space-y-2">
                          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-center text-muted-foreground">
                            Extracting text... {uploadProgress.toFixed(0)}%
                          </p>
                        </div>
                      )}
                      
                      {!uploading && (
                        <Button
                          onClick={() => handleFileUpload(uploadedFile)}
                          className="w-full"
                        >
                          Save Soil Analysis
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-primary hover:underline font-medium">Click to upload</span>
                        <span className="text-muted-foreground"> or drag and drop</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-2">
                        PDF or TXT files only (Max 10MB)
                      </p>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.txt,.text"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                          }
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;

