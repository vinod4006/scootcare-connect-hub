import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Zap, Shield, Smartphone } from "lucide-react";
import scooterLogo from "@/assets/scooter-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={scooterLogo} alt="VoltAssist" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-electric bg-clip-text text-transparent">
                VoltAssist
              </span>
            </div>
            <Button variant="outline" size="sm" className="md:hidden">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">24/7 Support Available</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              <span className="bg-gradient-electric bg-clip-text text-transparent">
                VoltAssist
              </span>
              <br />
              <span className="text-foreground">Support Center</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              Get instant help with your electric scooter. From troubleshooting to maintenance tips, 
              we're here to keep you rolling smoothly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-electric hover:shadow-electric transition-all duration-300">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chat Support
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse Help Articles
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-30 animate-float">
          <div className="w-12 h-12 bg-gradient-electric rounded-full blur-sm"></div>
        </div>
        <div className="absolute top-40 right-16 opacity-20 animate-float" style={{animationDelay: '1s'}}>
          <div className="w-8 h-8 bg-secondary rounded-full blur-sm"></div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 hover:shadow-card transition-all duration-300 group cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Mobile App</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Connect and manage your scooter directly from your phone
            </p>
            <div className="text-primary font-medium text-sm">Learn More →</div>
          </Card>

          <Card className="p-6 hover:shadow-card transition-all duration-300 group cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg">Troubleshooting</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Quick fixes for common issues and technical problems
            </p>
            <div className="text-secondary font-medium text-sm">Get Help →</div>
          </Card>

          <Card className="p-6 hover:shadow-card transition-all duration-300 group cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Warranty</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Check warranty status and file warranty claims
            </p>
            <div className="text-accent font-medium text-sm">Check Status →</div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={scooterLogo} alt="VoltAssist" className="w-6 h-6" />
              <span className="text-muted-foreground">© 2024 VoltAssist</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
