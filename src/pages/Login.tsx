import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import scooterLogo from "@/assets/scooter-logo.png";

const Login = () => {
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatMobileDisplay = (number: string) => {
    if (number.length < 4) return number;
    const last4 = number.slice(-4);
    const masked = "X".repeat(number.length - 4);
    return `${masked}${last4}`;
  };

  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if user exists, if not create a profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("mobile_number", `+91${mobileNumber}`)
        .maybeSingle();

      if (!existingProfile) {
        const { error } = await supabase
          .from("profiles")
          .insert([{ mobile_number: `+91${mobileNumber}` }]);

        if (error) throw error;
      }

      // Simulate OTP sending
      toast({
        title: "OTP Sent",
        description: `OTP sent to +91 ${formatMobileDisplay(mobileNumber)}`,
      });
      setStep("otp");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Mock verification - accept any 6-digit OTP
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        // Store mobile number in session storage
        sessionStorage.setItem("userMobile", `+91${mobileNumber}`);
        
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully",
        });
        
        // Check if there's a stored redirect destination
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          // Clear the stored redirect path
          sessionStorage.removeItem("redirectAfterLogin");
          // Redirect to the intended destination
          navigate(redirectPath);
        } else {
          // Default redirect to home page
          navigate("/");
        }
      } else {
        throw new Error("Invalid OTP");
      }
    } catch (error) {
      toast({
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMobile = () => {
    setStep("mobile");
    setOtp("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={scooterLogo} alt="VoltAssist" className="w-12 h-12" />
          </div>
          <CardTitle className="text-2xl font-bold">
            <span className="bg-gradient-electric bg-clip-text text-transparent">
              VoltAssist
            </span>
          </CardTitle>
          <CardDescription>
            {step === "mobile" 
              ? "Enter your mobile number to continue" 
              : "Enter the OTP sent to your mobile"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "mobile" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="flex">
                  <div className="flex items-center px-3 py-2 border border-r-0 border-input bg-muted rounded-l-md">
                    <span className="text-sm text-muted-foreground">+91</span>
                  </div>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setMobileNumber(value);
                    }}
                    className="rounded-l-none"
                    maxLength={10}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSendOTP} 
                className="w-full" 
                disabled={loading || mobileNumber.length !== 10}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  OTP sent to +91 {formatMobileDisplay(mobileNumber)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded-md border border-blue-200 dark:border-blue-800">
                    💡 <strong>Testing Note:</strong> Use any 6 digit number as OTP (e.g., 123456)
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={handleVerifyOTP} 
                  className="w-full" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleBackToMobile} 
                  className="w-full"
                >
                  Change Mobile Number
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;