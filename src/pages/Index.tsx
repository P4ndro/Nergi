import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, TrendingUp, MapPin, AlertTriangle, Calendar, Shield, CheckCircle } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import Navbar from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <Navbar />

  {/* Hero Section with shader background */}
  <section className="hero-section container mx-auto px-12 md:px-16 xl:px-24 py-10 md:py-12">
        {/* shader layers */}
        <div className="hero-shaders">
          <div className="hero-blob hero-blob--primary" />
          <div className="hero-blob hero-blob--accent" />
          <div className="hero-blob hero-blob--success" />
          <div className="hero-noise" />
          <div className="hero-vignette" />
        </div>

  <div className="relative rounded-2xl border border-border bg-background shadow-xl ring-1 ring-border/60 p-8 md:p-10">
  <div className="grid gap-3 md:grid-cols-2 items-center">
          {/* Left: main hero copy */}
          <div className="max-w-3xl text-left">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t("hero.title")}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex gap-3 justify-start">
              <Button size="default" onClick={() => navigate("/auth")} className="text-sm md:text-base px-5 md:px-6">
                {t("hero.ctaPrimary")}
              </Button>
              <Button size="default" variant="outline" onClick={() => navigate("/auth")} className="text-sm md:text-base px-5 md:px-6">
                {t("hero.ctaLogin")}
              </Button>
            </div>
          </div>

          {/* Right: additional text */}
          <div className="max-w-xl text-left md:-translate-y-[5px]">
            <h3 className="text-xl md:text-2xl font-semibold mb-3">{t("hero.right.title")}</h3>
            <ul className="space-y-2.5 text-muted-foreground text-sm md:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 mt-0.5 text-primary" />
                <span>{t("hero.right.point1")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 mt-0.5 text-primary" />
                <span>{t("hero.right.point2")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 mt-0.5 text-primary" />
                <span>{t("hero.right.point3")}</span>
              </li>
            </ul>
          </div>
        </div>
  </div>
      </section>

      {/* Features Grid */}
  <section className="container mx-auto px-12 md:px-16 xl:px-24 py-16">
        <div className="text-left mb-12">
          <h3 className="text-3xl font-bold mb-3">Why Farmers Choose Nergi</h3>
          <p className="text-muted-foreground">
            Comprehensive tools for modern agricultural decision-making
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl">
          <Card className="border-primary/20 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Location-Based Intelligence</CardTitle>
              <CardDescription>
                Get region-specific recommendations tailored to your exact location and local climate conditions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <CardTitle>Soil Analysis</CardTitle>
              <CardDescription>
                Real-time soil pH, nutrient levels, and moisture data to optimize your crop selection and amendments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <CardTitle>Pest & Disease Alerts</CardTitle>
              <CardDescription>
                Early warnings about fungal risks, insect threats, and weather hazards with safe mitigation strategies
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>4-Week Planting Plans</CardTitle>
              <CardDescription>
                Detailed week-by-week task calendars with specific timings for watering, fertilizing, and monitoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Crop Database</CardTitle>
              <CardDescription>
                Extensive library of crops with optimal pH ranges, planting windows, and rotation recommendations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <CardTitle>Safe Practices</CardTitle>
              <CardDescription>
                AI assistant prioritizes organic and IPM methods, tracks chemical use, and ensures regulatory compliance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-12 md:px-16 xl:px-24 py-20">
  <Card className="max-w-3xl border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 shadow-md">
          <CardContent className="pt-12 pb-12 text-left">
            <h3 className="text-3xl font-bold mb-4">Ready to Grow Smarter?</h3>
            <p className="text-lg text-muted-foreground mb-8">
              Join Georgian farmers making data-driven planting decisions with Nergi
            </p>
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-12">
              Get Started Free
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
  <div className="container mx-auto px-12 md:px-16 xl:px-24 text-left text-sm text-muted-foreground">
          <p>© 2025 Nergi. AI-powered agricultural assistant for Georgian farmers.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
