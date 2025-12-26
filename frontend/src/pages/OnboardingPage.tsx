import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  User, Mail, Phone, MapPin, Building2, IndianRupee, 
  Users, Home, Car, Shield, Heart, Bus, ShoppingCart, 
  Zap, GraduationCap, ChevronRight, ChevronLeft, Check
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { id: 1, title: "Identity", icon: User },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Finances", icon: IndianRupee },
  { id: 4, title: "Lifestyle", icon: Home },
  { id: 5, title: "Spending", icon: ShoppingCart },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh"
];

const CITY_TIERS = [
  { value: "tier1", label: "Tier 1 (Metro Cities)" },
  { value: "tier2", label: "Tier 2 (Major Cities)" },
  { value: "tier3", label: "Tier 3 (Smaller Cities)" },
  { value: "rural", label: "Rural Areas" },
];

interface OnboardingData {
  // Identity
  fullName: string;
  email: string;
  contactNumber: string;
  // Demographics
  state: string;
  cityTier: string;
  // Financial
  annualIncome: number;
  taxRegime: string;
  familySize: number;
  // Lifestyle
  housingStatus: string;
  vehicleOwnership: string;
  hasHealthInsurance: string;
  // Spending
  healthcareSpend: number;
  transportSpend: number;
  grocerySpend: number;
  utilitiesSpend: number;
  educationSpend: number;
}

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    fullName: "",
    email: "",
    contactNumber: "",
    state: "",
    cityTier: "",
    annualIncome: 500000,
    taxRegime: "new",
    familySize: 2,
    housingStatus: "rented",
    vehicleOwnership: "none",
    hasHealthInsurance: "no",
    healthcareSpend: 2000,
    transportSpend: 3000,
    grocerySpend: 8000,
    utilitiesSpend: 3000,
    educationSpend: 2000,
  });

  const updateData = (field: keyof OnboardingData, value: string | number) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoogleLogin = () => {
    // Simulated Google login - in production, this would use OAuth
    toast({
      title: "Google Login",
      description: "Google OAuth requires backend integration. Using demo mode.",
    });
    updateData("fullName", "Demo User");
    updateData("email", "demo@example.com");
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save to localStorage and navigate
      localStorage.setItem("onboardingData", JSON.stringify(data));
      localStorage.setItem("isOnboarded", "true");
      toast({
        title: "Welcome aboard! 🎉",
        description: "Your profile has been set up successfully.",
      });
      navigate("/");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Let's get to know you</h2>
              <p className="text-muted-foreground">Your identity helps us personalize your experience</p>
            </div>

            {/* Google Login Button */}
            <Button
              variant="outline"
              className="w-full h-12 gap-3 border-border/50 hover:bg-accent/50"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or fill manually</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={data.fullName}
                  onChange={(e) => updateData("fullName", e.target.value)}
                  className="h-12 bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={data.email}
                  onChange={(e) => updateData("email", e.target.value)}
                  className="h-12 bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Contact Number
                </Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={data.contactNumber}
                  onChange={(e) => updateData("contactNumber", e.target.value)}
                  className="h-12 bg-background/50 border-border/50"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Where are you located?</h2>
              <p className="text-muted-foreground">Policy impacts vary by state and city tier</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  State of Residence
                </Label>
                <Select value={data.state} onValueChange={(v) => updateData("state", v)}>
                  <SelectTrigger className="h-12 bg-background/50 border-border/50">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  City / Location Tier
                </Label>
                <Select value={data.cityTier} onValueChange={(v) => updateData("cityTier", v)}>
                  <SelectTrigger className="h-12 bg-background/50 border-border/50">
                    <SelectValue placeholder="Select city tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITY_TIERS.map((tier) => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Financial Profile</h2>
              <p className="text-muted-foreground">Helps calculate policy impact on your wallet</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-primary" />
                  Annual Income: {formatCurrency(data.annualIncome)}
                </Label>
                <Slider
                  value={[data.annualIncome]}
                  onValueChange={([v]) => updateData("annualIncome", v)}
                  min={100000}
                  max={5000000}
                  step={50000}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹1L</span>
                  <span>₹50L+</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-primary" />
                  Tax Regime
                </Label>
                <RadioGroup
                  value={data.taxRegime}
                  onValueChange={(v) => updateData("taxRegime", v)}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="new"
                    className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      data.taxRegime === "new"
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="new" id="new" className="sr-only" />
                    <span>New Regime</span>
                  </Label>
                  <Label
                    htmlFor="old"
                    className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      data.taxRegime === "old"
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="old" id="old" className="sr-only" />
                    <span>Old Regime</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Family Size: {data.familySize} members
                </Label>
                <Slider
                  value={[data.familySize]}
                  onValueChange={([v]) => updateData("familySize", v)}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4"
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Lifestyle & Assets</h2>
              <p className="text-muted-foreground">We'll only show policies that affect you</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" />
                  Housing Status
                </Label>
                <RadioGroup
                  value={data.housingStatus}
                  onValueChange={(v) => updateData("housingStatus", v)}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="rented"
                    className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      data.housingStatus === "rented"
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="rented" id="rented" className="sr-only" />
                    <span>Rented</span>
                  </Label>
                  <Label
                    htmlFor="owned"
                    className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      data.housingStatus === "owned"
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="owned" id="owned" className="sr-only" />
                    <span>Owned</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-primary" />
                  Vehicle Ownership
                </Label>
                <RadioGroup
                  value={data.vehicleOwnership}
                  onValueChange={(v) => updateData("vehicleOwnership", v)}
                  className="grid grid-cols-2 gap-4"
                >
                  {["none", "petrol", "diesel", "ev"].map((type) => (
                    <Label
                      key={type}
                      htmlFor={type}
                      className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all capitalize ${
                        data.vehicleOwnership === type
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={type} id={type} className="sr-only" />
                      <span>{type === "none" ? "No Vehicle" : type === "ev" ? "Electric" : type}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Private Health Insurance
                </Label>
                <RadioGroup
                  value={data.hasHealthInsurance}
                  onValueChange={(v) => updateData("hasHealthInsurance", v)}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="insYes"
                    className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      data.hasHealthInsurance === "yes"
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="yes" id="insYes" className="sr-only" />
                    <span>Yes</span>
                  </Label>
                  <Label
                    htmlFor="insNo"
                    className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      data.hasHealthInsurance === "no"
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="no" id="insNo" className="sr-only" />
                    <span>No</span>
                  </Label>
                </RadioGroup>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Monthly Spending</h2>
              <p className="text-muted-foreground">Estimate your monthly expenses in each category</p>
            </div>

            <div className="space-y-6">
              {[
                { key: "healthcareSpend", label: "Healthcare", icon: Heart, max: 20000 },
                { key: "transportSpend", label: "Transportation", icon: Bus, max: 15000 },
                { key: "grocerySpend", label: "Groceries & Food", icon: ShoppingCart, max: 30000 },
                { key: "utilitiesSpend", label: "Utilities", icon: Zap, max: 10000 },
                { key: "educationSpend", label: "Education", icon: GraduationCap, max: 25000 },
              ].map(({ key, label, icon: Icon, max }) => (
                <div key={key} className="space-y-3">
                  <Label className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      {label}
                    </span>
                    <span className="text-primary font-semibold">
                      {formatCurrency(data[key as keyof OnboardingData] as number)}
                    </span>
                  </Label>
                  <Slider
                    value={[data[key as keyof OnboardingData] as number]}
                    onValueChange={([v]) => updateData(key as keyof OnboardingData, v)}
                    min={0}
                    max={max}
                    step={500}
                    className="py-2"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 px-4 py-6 safe-area-top safe-area-bottom">
      <div className="max-w-md mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: currentStep === step.id ? 1.1 : 1,
                  backgroundColor:
                    currentStep >= step.id
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted))",
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <step.icon className={`w-5 h-5 ${currentStep >= step.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                )}
              </motion.div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 transition-colors ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <GlassCard className="p-6">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </GlassCard>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 h-12 gap-2"
          >
            {currentStep === 5 ? (
              <>
                Complete
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
