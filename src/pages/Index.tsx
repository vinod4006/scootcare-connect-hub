import scooterLogo from "@/assets/scooter-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <img src={scooterLogo} alt="VoltAssist" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-electric bg-clip-text text-transparent">
                VoltAssist
              </span>
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
        </div>
      </main>
    </div>
  );
};

export default Index;
