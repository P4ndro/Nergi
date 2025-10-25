import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Leaf } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and redirect accordingly
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30">
      <div className="text-center">
        <Leaf className="w-16 h-16 text-primary animate-pulse mx-auto mb-6" />
        <p className="text-muted-foreground">Loading Nergi...</p>
      </div>
    </div>
  );
};

export default Index;
