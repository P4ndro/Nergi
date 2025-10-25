import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, TrendingUp, MapPin, AlertTriangle, Calendar, Shield, CheckCircle } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
            <h2 className="text-2xl md:text-3xl font-bold mb-4 -translate-y-[5px] bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t("hero.title")}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex gap-3 justify-start">
              <Button size="default" onClick={() => navigate("/auth")} className="text-sm md:text-base px-5 md:px-6">
                {t("hero.ctaPrimary")}
              </Button>
            </div>
          </div>

          {/* Right: additional text */}
          <div className="max-w-xl text-left md:-translate-y-[5px]">
            <h3 className="text-lg md:text-xl font-semibold mb-3">{t("hero.right.title")}</h3>
            <ul className="space-y-2.5 text-muted-foreground text-sm md:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                <span>{t("hero.right.point1")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                <span>{t("hero.right.point2")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
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
          <h3 className="text-3xl font-bold mb-3">{t("home.features.title")}</h3>
          <p className="text-muted-foreground">
            {t("home.features.subtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl">
          <Card className="border-primary/20 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t("home.features.cards.location.title")}</CardTitle>
              <CardDescription>
                {t("home.features.cards.location.desc")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <CardTitle>{t("home.features.cards.soil.title")}</CardTitle>
              <CardDescription>
                {t("home.features.cards.soil.desc")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <CardTitle>{t("home.features.cards.pest.title")}</CardTitle>
              <CardDescription>
                {t("home.features.cards.pest.desc")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t("home.features.cards.plans.title")}</CardTitle>
              <CardDescription>
                {t("home.features.cards.plans.desc")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t("home.features.cards.database.title")}</CardTitle>
              <CardDescription>
                {t("home.features.cards.database.desc")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <CardTitle>{t("home.features.cards.safe.title")}</CardTitle>
              <CardDescription>
                {t("home.features.cards.safe.desc")}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-12 md:px-16 xl:px-24 py-20">
        <Card className="max-w-3xl mx-auto border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 shadow-md">
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-3xl font-bold mb-4">{t("home.cta.title")}</h3>
            <p className="text-lg text-muted-foreground mb-8">
              {t("home.cta.subtitle")}
            </p>
            <div className="flex justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-12">
                {t("home.cta.button")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
