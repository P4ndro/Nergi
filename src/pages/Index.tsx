import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, TrendingUp, MapPin, AlertTriangle, Calendar, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-success/5 rounded-full blur-3xl animate-float-fast" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Smart Farming for Georgian Agriculture
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Get AI-powered crop recommendations based on your location, soil conditions, and weather forecasts. 
            Make informed planting decisions and maximize your harvest.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Start Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-3">Why Farmers Choose Nergi</h3>
          <p className="text-muted-foreground">
            Comprehensive tools for modern agricultural decision-making
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
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

          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
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

          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
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

          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
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

          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
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

          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
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
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-12 pb-12 text-center">
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
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2025 Nergi. AI-powered agricultural assistant for Georgian farmers.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
