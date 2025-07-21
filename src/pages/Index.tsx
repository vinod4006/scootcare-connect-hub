import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import scooterLogo from "@/assets/scooter-logo.png";

const Index = () => {
  const [userMobile, setUserMobile] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const mobile = sessionStorage.getItem("userMobile");
    setUserMobile(mobile);
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userMobile");
    setUserMobile(null);
  };

  const handleChat = () => {
    if (userMobile) {
      navigate("/chat");
    } else {
      // Store intended destination before redirecting to login
      sessionStorage.setItem("redirectAfterLogin", "/chat");
      navigate("/login");
    }
  };

  const handleOrders = () => {
    if (userMobile) {
      navigate("/orders");
    } else {
      // Store intended destination before redirecting to login
      sessionStorage.setItem("redirectAfterLogin", "/orders");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={scooterLogo} alt="VoltAssist" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-electric bg-clip-text text-transparent">
                VoltAssist
              </span>
            </div>
            <div className="flex items-center gap-3">
              {userMobile ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {userMobile}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={handleLogin}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <img src={scooterLogo} alt="VoltAssist" className="w-16 h-16 mx-auto mb-6 animate-fade-in" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
            <span className="bg-gradient-electric bg-clip-text text-transparent">
              VoltAssist
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 animate-fade-in">
            Get instant answers to your electric scooter questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button 
              onClick={handleChat} 
              size="lg" 
              className="hover-scale"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Chat
            </Button>
            <Button 
              onClick={handleOrders} 
              size="lg" 
              variant="outline"
              className="hover-scale"
            >
              <Package className="w-5 h-5 mr-2" />
              My Orders
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
