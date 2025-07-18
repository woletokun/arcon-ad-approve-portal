import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shield, 
  FileCheck, 
  Zap, 
  Users, 
  Clock,
  CheckCircle,
  QrCode,
  ArrowRight,
  Star,
  Award
} from "lucide-react";

/**
 * Landing Page Component
 * 
 * Professional landing page for ARCON e-Ad Approval Portal
 * Features:
 * - Hero section with clear value proposition
 * - Feature highlights for different user types
 * - Process overview
 * - Call-to-action sections
 * - Professional government/regulatory design
 */

export const Landing = () => {
  const session = useAuth();
  const user = session?.user;
  const [selectedRole, setSelectedRole] = useState<'advertiser' | 'reviewer'>('advertiser');

  const features = {
    advertiser: [
      {
        icon: FileCheck,
        title: "Submit with Confidence",
        description: "Upload your advertising materials with our streamlined submission process"
      },
      {
        icon: Clock,
        title: "Track Progress",
        description: "Real-time status updates on your submission review process"
      },
      {
        icon: QrCode,
        title: "Instant Certificates",
        description: "Download QR-enabled e-certificates immediately upon approval"
      }
    ],
    reviewer: [
      {
        icon: Shield,
        title: "Efficient Review",
        description: "Comprehensive review tools with structured approval workflows"
      },
      {
        icon: Users,
        title: "Collaboration",
        description: "Team review features with comment and feedback systems"
      },
      {
        icon: Zap,
        title: "Quick Actions",
        description: "Streamlined approve/reject process with automated notifications"
      }
    ]
  };

  const processSteps = [
    {
      number: "01",
      title: "Submit Application",
      description: "Advertisers upload campaign materials and required documentation"
    },
    {
      number: "02", 
      title: "ARCON Review",
      description: "Expert reviewers evaluate submissions against regulatory standards"
    },
    {
      number: "03",
      title: "Approval & Certificate",
      description: "Approved campaigns receive QR-enabled e-certificates for verification"
    },
    {
      number: "04",
      title: "Public Verification", 
      description: "Anyone can verify certificate authenticity via QR code or ID lookup"
    }
  ];

  const stats = [
    { label: "Advertisements Approved", value: "2,500+", icon: CheckCircle },
    { label: "Active Advertisers", value: "150+", icon: Users },
    { label: "Average Review Time", value: "2.5 hrs", icon: Clock },
    { label: "Compliance Rate", value: "98.5%", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-lg font-bold">ARCON e-Ad Portal</h1>
                <span className="text-xs text-muted-foreground">
                  Advertising Regulatory Council of Nigeria
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              Regulatory Compliance Made Simple
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ARCON e-Ad Approval Portal
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamlined digital platform for advertising submission, review, and approval. 
              Get your campaigns approved faster with automated workflows and instant e-certificates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/submit">
                  <Button size="lg" className="text-lg px-8">
                    Submit Your Ad
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-8">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/verify">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Verify Certificate
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Every Stakeholder
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're an advertiser seeking approval or an ARCON reviewer, 
              our platform provides the tools you need.
            </p>
          </div>

          {/* Role Selector */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-lg border p-1">
              <Button
                variant={selectedRole === 'advertiser' ? 'default' : 'ghost'}
                onClick={() => setSelectedRole('advertiser')}
                className="rounded-md"
              >
                For Advertisers
              </Button>
              <Button
                variant={selectedRole === 'reviewer' ? 'default' : 'ghost'}
                onClick={() => setSelectedRole('reviewer')}
                className="rounded-md"
              >
                For Reviewers
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {features[selectedRole].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process ensures fast, efficient ad approval while maintaining 
              regulatory compliance.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join hundreds of advertisers already using ARCON's digital approval platform. 
                Submit your first campaign today.
              </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                  <Link to="/auth">Create Account</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                  <Link to="/verify">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold">ARCON e-Ad Portal</span>
            </div>
            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p>© 2024 Intelligence Index Limited. All rights reserved.</p>
              <p>Advertising Regulatory Council of Nigeria</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
