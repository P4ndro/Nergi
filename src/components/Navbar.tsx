import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, UserRound, Globe2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocale } from "@/context/LocaleContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { lang, setLang, t } = useLocale();

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLanguageChange = (value: string) => {
    setLang(value as any);
    toast.success(value === "ka" ? "ენის ცვლილება შესრულებულია" : "Language updated");
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
      toast.success("Signed out");
      navigate("/");
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign out");
    }
  };

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur">
  <div className="container mx-0 px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Nergi</h1>
        </button>
        
        <div className="flex gap-3 items-center">
          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-3 gap-2">
                <Globe2 className="h-4 w-4" />
                <span className="text-sm font-medium uppercase">{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>{t("nav.language")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={lang} onValueChange={handleLanguageChange}>
                <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="ka">ქართული (Georgian)</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12">
                  <UserRound className="w-10 h-10 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{t("nav.myAccount")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  {t("nav.dashboard")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/my-crops")}>
                  {t("nav.myCrops")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/add-crop")}>
                  {t("nav.addCrop")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={async (e) => {
                    e.preventDefault();
                    await handleSignOut();
                  }}
                >
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                {t("nav.login")}
              </Button>
              <Button onClick={() => navigate("/auth")}>
                {t("nav.getStarted")}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
