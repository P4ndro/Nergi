import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import { Target, Eye, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const About = () => {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <Navbar />

      <section className="container mx-auto px-12 md:px-16 xl:px-24 py-12 md:py-16">
        {/* Page hero */}
        <div className="max-w-3xl text-left mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("about.title")}</h1>
          <p className="text-muted-foreground text-base md:text-lg">{t("about.subtitle")}</p>
        </div>

  {/* Mission */}
  <Card className="mb-6 border-primary/20 shadow-sm transition-all duration-200 transform-gpu hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(2,44,34,0.45)] hover:ring-2 hover:ring-emerald-800/25 hover:border-emerald-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </span>
              {t("about.mission.title")}
            </CardTitle>
            <CardDescription>{t("about.mission.body")}</CardDescription>
          </CardHeader>
        </Card>

  {/* Vision */}
  <Card className="mb-6 border-primary/20 shadow-sm transition-all duration-200 transform-gpu hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(2,44,34,0.45)] hover:ring-2 hover:ring-emerald-800/25 hover:border-emerald-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </span>
              {t("about.vision.title")}
            </CardTitle>
            <CardDescription>{t("about.vision.body")}</CardDescription>
          </CardHeader>
        </Card>

  {/* Team */}
  <Card className="border-primary/20 shadow-sm transition-all duration-200 transform-gpu hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(2,44,34,0.45)] hover:ring-2 hover:ring-emerald-800/25 hover:border-emerald-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </span>
              {t("about.team.title")}
            </CardTitle>
            <CardDescription>{t("about.team.body")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1,2,3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 transform-gpu hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(2,44,34,0.4)] hover:ring-1 hover:ring-emerald-900/25 hover:border-emerald-900/30"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {i === 1 ? "A" : i === 2 ? "G" : "N"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {t(`about.team.member${i}.name` as any)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(`about.team.member${i}.role` as any)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default About;
