import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Bookmark, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPolicies, categoryBreakdown } from "@/data/mockPolicies";

const indianStates = [
  { id: "MH", name: "Maharashtra", x: 25, y: 55 },
  { id: "GJ", name: "Gujarat", x: 18, y: 45 },
  { id: "KA", name: "Karnataka", x: 28, y: 72 },
  { id: "TN", name: "Tamil Nadu", x: 35, y: 82 },
  { id: "DL", name: "Delhi", x: 32, y: 28 },
  { id: "UP", name: "Uttar Pradesh", x: 42, y: 35 },
  { id: "RJ", name: "Rajasthan", x: 22, y: 32 },
  { id: "MP", name: "Madhya Pradesh", x: 35, y: 45 },
  { id: "BR", name: "Bihar", x: 55, y: 38 },
  { id: "WB", name: "West Bengal", x: 62, y: 45 },
];

const BreakdownPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const policy = mockPolicies.find((p) => p.id === id) || mockPolicies[0];

  const isStateAffected = (stateName: string) => {
    return policy.affectedStates.includes(stateName) || policy.affectedStates.includes("All States");
  };

  // Calculate donut chart segments
  const total = categoryBreakdown.reduce((acc, cat) => acc + Math.abs(cat.amount), 0);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-medium text-sm">Full Breakdown</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bookmark className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Policy Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-serif text-xl md:text-2xl leading-tight mb-2">
            {policy.title}
          </h1>
          <p className="text-sm text-muted-foreground">{policy.description}</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Impact Summary */}
              <GlassCard className="p-6" hover={false}>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Total Monthly Impact</p>
                  <p
                    className={`font-serif text-4xl ${
                      policy.impactType === "positive" ? "impact-positive" : "impact-negative"
                    }`}
                  >
                    {policy.impact >= 0 ? "+" : ""}₹{Math.abs(policy.impact).toLocaleString()}
                  </p>
                </div>
              </GlassCard>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3">
                <GlassCard className="p-4" hover={false}>
                  <p className="text-xs text-muted-foreground mb-1">Direct</p>
                  <p className={`font-serif text-xl ${policy.details.directImpact >= 0 ? "impact-positive" : "impact-negative"}`}>
                    {policy.details.directImpact >= 0 ? "+" : ""}₹{Math.abs(policy.details.directImpact)}
                  </p>
                </GlassCard>
                <GlassCard className="p-4" hover={false}>
                  <p className="text-xs text-muted-foreground mb-1">Indirect</p>
                  <p className={`font-serif text-xl ${policy.details.indirectImpact >= 0 ? "impact-positive" : "impact-negative"}`}>
                    {policy.details.indirectImpact >= 0 ? "+" : ""}₹{Math.abs(policy.details.indirectImpact)}
                  </p>
                </GlassCard>
              </div>

              {/* Factors List */}
              <div className="space-y-2">
                {policy.details.factors.map((factor, index) => (
                  <GlassCard key={index} className="p-3" hover={false}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{factor.label}</span>
                      <span className={`font-serif ${factor.amount >= 0 ? "impact-positive" : "impact-negative"}`}>
                        {factor.amount >= 0 ? "+" : ""}₹{Math.abs(factor.amount)}
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="categories">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Donut Chart */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="text-sm font-medium mb-4 text-center">Category Distribution</h3>
                <div className="relative w-48 h-48 mx-auto">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {categoryBreakdown.map((cat, index) => {
                      const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
                      const offset = categoryBreakdown.slice(0, index).reduce((acc, c) => acc + c.percentage, 0);
                      return (
                        <circle
                          key={cat.category}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={colors[index % colors.length]}
                          strokeWidth="20"
                          strokeDasharray={`${cat.percentage * 2.51} ${251 - cat.percentage * 2.51}`}
                          strokeDashoffset={`${-offset * 2.51}`}
                          className="transition-all duration-500"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="font-serif text-2xl">{categoryBreakdown.length}</p>
                      <p className="text-xs text-muted-foreground">Categories</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Category List */}
              <div className="space-y-2">
                {categoryBreakdown.map((cat, index) => {
                  const colors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];
                  return (
                    <GlassCard key={cat.category} className="p-3" hover={false}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                          <span className="text-sm">{cat.category}</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-serif ${cat.amount >= 0 ? "impact-positive" : "impact-negative"}`}>
                            {cat.amount >= 0 ? "+" : ""}₹{Math.abs(cat.amount)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">{cat.percentage}%</span>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="regions">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Simplified India Map */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="text-sm font-medium mb-4 text-center">Affected Regions</h3>
                <div className="relative w-full aspect-[4/5] max-w-xs mx-auto bg-muted/30 rounded-lg overflow-hidden">
                  {/* Simplified state dots */}
                  {indianStates.map((state) => (
                    <motion.div
                      key={state.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * indianStates.indexOf(state) }}
                      className={`absolute w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                        isStateAffected(state.name) ? "bg-chart-1" : "bg-muted-foreground/20"
                      }`}
                      style={{ left: `${state.x}%`, top: `${state.y}%` }}
                      title={state.name}
                    >
                      {isStateAffected(state.name) && (
                        <div className="w-2 h-2 rounded-full bg-white/50" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              {/* Affected States List */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Affected States
                </h3>
                <div className="flex flex-wrap gap-2">
                  {policy.affectedStates.map((state) => (
                    <span
                      key={state}
                      className="px-3 py-1.5 text-sm bg-chart-1/10 text-chart-1 rounded-full border border-chart-1/20"
                    >
                      {state}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BreakdownPage;
