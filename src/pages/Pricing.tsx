import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

const Pricing = () => {
  const { t } = useLocale();

  const features = {
    free: [
      t("pricing.features.aiBasic"),
      t("pricing.features.cropDb"),
      t("pricing.features.community"),
    ],
    pro: [
      t("pricing.features.aiAdvanced"),
      t("pricing.features.weeklyPlans"),
      t("pricing.features.weatherAlerts"),
      t("pricing.features.soilTracking"),
    ],
    enterprise: [
      t("pricing.features.team"),
      t("pricing.features.api"),
      t("pricing.features.customModels"),
      t("pricing.features.dedicatedSupport"),
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <Navbar />

      <section className="container mx-auto px-12 md:px-16 xl:px-24 py-12 md:py-16">
        <div className="max-w-3xl text-left mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("pricing.title")}</h1>
          <p className="text-muted-foreground text-base md:text-lg">{t("pricing.subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Free */}
          <Card className="border-primary/20 shadow-sm transition-all duration-200 transform-gpu hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 hover:ring-1 hover:ring-primary/20">
            <CardHeader>
              <CardTitle>{t("pricing.plans.free.title")}</CardTitle>
              <CardDescription>{t("pricing.plans.free.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">{t("pricing.plans.free.price")}</span>
                <span className="text-muted-foreground"> {t("pricing.perMonth")}</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                {features.free.map((f, i) => (
                  <li className="flex items-start gap-2" key={i}>
                    <Check className="h-4 w-4 mt-0.5 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full transition-shadow duration-200 hover:shadow-md">
                {t("pricing.cta.startFree")}
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-primary/30 shadow-md relative overflow-hidden transition-all duration-200 transform-gpu hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary/50 hover:ring-2 hover:ring-primary/25">
            <div className="absolute right-4 top-4 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {t("pricing.badge.popular")}
            </div>
            <CardHeader>
              <CardTitle>{t("pricing.plans.pro.title")}</CardTitle>
              <CardDescription>{t("pricing.plans.pro.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">{t("pricing.plans.pro.price")}</span>
                <span className="text-muted-foreground"> {t("pricing.perMonth")}</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                {features.pro.map((f, i) => (
                  <li className="flex items-start gap-2" key={i}>
                    <Check className="h-4 w-4 mt-0.5 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full transition-shadow duration-200 hover:shadow-lg">
                {t("pricing.cta.choosePro")}
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card className="border-primary/20 shadow-sm transition-all duration-200 transform-gpu hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 hover:ring-1 hover:ring-primary/20">
            <CardHeader>
              <CardTitle>{t("pricing.plans.enterprise.title")}</CardTitle>
              <CardDescription>{t("pricing.plans.enterprise.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">{t("pricing.plans.enterprise.price")}</span>
                <span className="text-muted-foreground"> {t("pricing.perMonth")}</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                {features.enterprise.map((f, i) => (
                  <li className="flex items-start gap-2" key={i}>
                    <Check className="h-4 w-4 mt-0.5 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full transition-shadow duration-200 hover:shadow-md">
                {t("pricing.cta.contactSales")}
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">{t("pricing.contactNote")}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
