import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Leaf, AlertTriangle, TrendingDown, MapPin, Users } from "lucide-react";
import Navbar from "@/components/Navbar";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Leaf className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold">About Nergi</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              An AI-powered agricultural assistant designed to help Georgian farmers make data-driven decisions
              and maximize their crop yields through intelligent recommendations.
            </p>
          </div>

          {/* Problems We Address */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-center">Problems We Address</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <CardTitle>Limited Access to Agricultural Data</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Many Georgian farmers lack access to region-specific agricultural data, weather forecasts,
                   making it difficult to plan optimal planting seasons and crop selection.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-orange-500" />
                    </div>
                    <CardTitle>Unpredictable Weather & Crop Losses</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Changing weather patterns and lack of early warning systems lead to crop losses from
                    unexpected frosts, droughts, and heavy rainfall, impacting farmers' livelihoods.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-yellow-500" />
                    </div>
                    <CardTitle>Inefficient/too much Pest & Disease Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Without proper knowledge of pest risks and prevention strategies, farmers face significant
                    losses from fungal diseases, insects, and other threats that could be prevented with timely actions.
                    Too much pesticide and fertilizer use can also harm the environment and the health of the consumers.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-500" />
                    </div>
                    <CardTitle>Region-Specific Knowledge Gaps</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Georgia's diverse climate (Samegrelo's humidity, Kakheti's continental climate) requires
                    specific knowledge for each region, which is often not readily available or accessible to farmers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Our Solution */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Leaf className="w-6 h-6 text-primary" />
                Our Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                <strong>Nergi</strong> provides Georgian farmers with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>AI-powered crop recommendations</strong> based on your specific location, soil analysis, and weather forecasts</li>
                <li><strong>Real-time weather data</strong> with 7-day forecasts to help plan planting and harvesting</li>
                <li><strong>Risk assessment</strong> for pests, diseases, and weather hazards with actionable mitigation strategies</li>
                <li><strong>planting calendars</strong> with week-by-week tasks including watering, fertilizing, and monitoring schedules</li>
                <li><strong>Region-specific advice</strong> tailored to Georgian agricultural practices and climate patterns</li>
                <li><strong>Safety-focused recommendations</strong> prioritizing organic and IPM (Integrated Pest Management) methods, EU standards </li>
              </ul>
            </CardContent>
          </Card>

         

          {/* Mission Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To give new farmers motivation and knowledge to start their own farm and become successful.
                Promote sustainable farming practices and reduce the use of pesticides and fertilizers.
                Help farmers maximize their harvest yields.

              </p>
              <p>
                We believe that with the right information and tools, Georgian farmers can overcome challenges like
                unpredictable weather, pest management, and crop selection to build more resilient and profitable farms.
              </p>
              <div className="flex gap-2 flex-wrap mt-4">
                <Badge variant="secondary">AI-Powered</Badge>
                <Badge variant="secondary">Data-Driven</Badge>
                <Badge variant="secondary">Georgian-Specific</Badge>
                <Badge variant="secondary">Sustainable</Badge>
                <Badge variant="secondary">EU Standards</Badge>
                <Badge variant="secondary">Newbie Farmers</Badge>

              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center space-y-6 py-12">
            <h2 className="text-3xl font-bold">Ready to Transform Your Farm?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join Georgian farmers who are using Nergi to make better decisions and increase their harvest yields
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/")}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;

