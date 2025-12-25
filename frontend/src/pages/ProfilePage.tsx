import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/profile/login");
    }
  }, [navigate]);

  // Form state
  const [name, setName] = useState("Rahul Sharma");
  const [monthlyIncome, setMonthlyIncome] = useState([50000]);
  const [notifications, setNotifications] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [impactAlerts, setImpactAlerts] = useState(true);

  const incomeCategories = [
    { id: "salary", label: "Salaried", selected: true },
    { id: "business", label: "Business", selected: false },
    { id: "freelance", label: "Freelance", selected: false },
    { id: "retired", label: "Retired", selected: false },
  ];

  const expenseCategories = [
    { id: "fuel", label: "Fuel & Transport", selected: true },
    { id: "groceries", label: "Groceries", selected: true },
    { id: "healthcare", label: "Healthcare", selected: true },
    { id: "education", label: "Education", selected: false },
    { id: "utilities", label: "Utilities", selected: true },
    { id: "rent", label: "Rent", selected: false },
  ];

  const [selectedIncomeType, setSelectedIncomeType] = useState("salary");
  const [selectedExpenses, setSelectedExpenses] = useState(["fuel", "groceries", "healthcare", "utilities"]);

  const toggleExpense = (id: string) => {
    setSelectedExpenses((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    toast({
      title: "Signed out",
      description: "You've been logged out successfully",
    });
    navigate("/profile/login");
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-medium text-sm">Profile & Settings</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-serif text-xl">{name}</h2>
                <p className="text-sm text-muted-foreground">Personal Profile</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-medium mb-3">Personal Information</h3>
          <GlassCard className="p-4 space-y-4" hover={false}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 border-border focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Monthly Income: ₹{monthlyIncome[0].toLocaleString()}</Label>
              <Slider
                value={monthlyIncome}
                onValueChange={setMonthlyIncome}
                max={500000}
                min={10000}
                step={5000}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹10,000</span>
                <span>₹5,00,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Income Type</Label>
              <div className="flex flex-wrap gap-2">
                {incomeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedIncomeType(cat.id)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      selectedIncomeType === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Expense Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium mb-3">Your Major Expenses</h3>
          <GlassCard className="p-4" hover={false}>
            <p className="text-xs text-muted-foreground mb-3">
              Select categories that apply to you for personalized impact calculations
            </p>
            <div className="flex flex-wrap gap-2">
              {expenseCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleExpense(cat.id)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    selectedExpenses.includes(cat.id)
                      ? "bg-chart-2/20 text-chart-2 border border-chart-2/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </h3>
          <GlassCard className="p-4 space-y-4" hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Receive alerts on your device</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Daily Digest</p>
                <p className="text-xs text-muted-foreground">Summary of policy impacts</p>
              </div>
              <Switch
                checked={dailyDigest}
                onCheckedChange={setDailyDigest}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Impact Alerts</p>
                <p className="text-xs text-muted-foreground">Notify when impact exceeds ₹100</p>
              </div>
              <Switch
                checked={impactAlerts}
                onCheckedChange={setImpactAlerts}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Other Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Privacy & Security</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Help & Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 cursor-pointer" onClick={handleLogout}>
            <div className="flex items-center gap-3 text-chart-1">
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Sign Out</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button className="w-full h-12" size="lg">
            Save Changes
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
