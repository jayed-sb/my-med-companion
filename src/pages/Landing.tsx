import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageSquare, 
  FileText, 
  Pill, 
  Upload, 
  Search, 
  Brain, 
  MapPin,
  Shield,
  Clock,
  Smartphone
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light via-background to-medical-light/20">
      {/* Header */}
      <header className="border-b border-medical-primary/10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-medical rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-medical-primary">Medi Buddy</span>
          </div>
          <Link to="/auth">
            <Button variant="medical" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 bg-medical-light text-medical-primary">
            AI-Powered Medical Management
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-medical-primary mb-6">
            Your Personal
            <span className="bg-gradient-medical bg-clip-text text-transparent"> Medical </span>
            Companion
          </h1>
          <p className="text-lg md:text-xl text-medical-dark/80 mb-8 max-w-2xl mx-auto">
            Organize your medical records, get AI-powered insights, and take control of your health journey with our comprehensive medical record management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="medical" size="lg" className="min-w-[200px]">
                Start Managing Your Health
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="min-w-[200px]">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-medical-primary mb-4">
            Everything You Need to Manage Your Health
          </h2>
          <p className="text-lg text-medical-dark/80 max-w-2xl mx-auto">
            From AI-powered record analysis to medicine price tracking, Medi Buddy provides comprehensive tools for your medical management needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-medical-primary/20 hover:shadow-medical transition-all duration-300">
            <CardHeader>
              <FileText className="w-8 h-8 text-medical-primary mb-2" />
              <CardTitle className="text-medical-primary">Smart Records</CardTitle>
              <CardDescription>
                Upload and organize your medical records with AI-powered text extraction and categorization.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-medical-primary/20 hover:shadow-medical transition-all duration-300">
            <CardHeader>
              <MessageSquare className="w-8 h-8 text-medical-primary mb-2" />
              <CardTitle className="text-medical-primary">AI Chat</CardTitle>
              <CardDescription>
                Ask questions about your medical history and get intelligent insights from your records.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-medical-primary/20 hover:shadow-medical transition-all duration-300">
            <CardHeader>
              <Pill className="w-8 h-8 text-medical-primary mb-2" />
              <CardTitle className="text-medical-primary">Medicine Tracker</CardTitle>
              <CardDescription>
                Get detailed medicine information, pricing, and track your current medications.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-medical-primary/20 hover:shadow-medical transition-all duration-300">
            <CardHeader>
              <MapPin className="w-8 h-8 text-medical-primary mb-2" />
              <CardTitle className="text-medical-primary">Doctor Finder</CardTitle>
              <CardDescription>
                Find nearby doctors and specialists based on your location and medical needs.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-medical-light/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-medical-primary mb-4">
              How It Works
            </h2>
            <p className="text-lg text-medical-dark/80 max-w-2xl mx-auto">
              Simple steps to start managing your health records intelligently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-medical-primary mb-2">Upload Records</h3>
              <p className="text-medical-dark/80">
                Simply upload photos of your medical records, prescriptions, and test results.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-medical-primary mb-2">AI Analysis</h3>
              <p className="text-medical-dark/80">
                Our AI extracts and categorizes important information from your medical documents.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-medical-primary mb-2">Smart Insights</h3>
              <p className="text-medical-dark/80">
                Search, chat, and get intelligent insights about your health history and medications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-medical-primary mb-4">
            Why Choose Medi Buddy?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-medical-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-medical-primary mb-2">Secure & Private</h3>
              <p className="text-medical-dark/80">
                Your medical data is encrypted and stored securely with industry-standard security measures.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Clock className="w-8 h-8 text-medical-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-medical-primary mb-2">Save Time</h3>
              <p className="text-medical-dark/80">
                No more searching through physical files. Find any medical information instantly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Smartphone className="w-8 h-8 text-medical-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-medical-primary mb-2">Always Accessible</h3>
              <p className="text-medical-dark/80">
                Access your medical records anytime, anywhere from any device with internet connection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-medical py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already managing their medical records intelligently with Medi Buddy.
          </p>
          <Link to="/auth">
            <Button variant="secondary" size="lg" className="min-w-[200px]">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-medical-dark text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-medical rounded flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">Medi Buddy</span>
          </div>
          <p className="text-white/70">
            Your trusted companion for medical record management
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;