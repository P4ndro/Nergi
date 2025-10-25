import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, TrendingUp, MapPin, AlertTriangle, Calendar, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t('hero_headline')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {t('hero_sub')}
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              {t('cta_get_started')}
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              {t('cta_go_dashboard')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-3">{t('why_choose')}</h3>
          <p className="text-muted-foreground">{t('features_sub')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t('card1_title')}</CardTitle>
              <CardDescription>{t('card1_desc')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <CardTitle>{t('card2_title')}</CardTitle>
              <CardDescription>{t('card2_desc')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <CardTitle>{t('card3_title')}</CardTitle>
              <CardDescription>{t('card3_desc')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t('card4_title')}</CardTitle>
              <CardDescription>{t('card4_desc')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t('card5_title')}</CardTitle>
              <CardDescription>{t('card5_desc')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <CardTitle>{t('card6_title')}</CardTitle>
              <CardDescription>{t('card6_desc')}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-3xl font-bold mb-4">{t('ready_grow')}</h3>
            <p className="text-lg text-muted-foreground mb-8">{t('join_copy')}</p>
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-12">
              {t('cta_get_started')}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{t('footer_text')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
