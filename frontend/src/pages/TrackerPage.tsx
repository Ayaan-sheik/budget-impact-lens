import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Filter, Calendar } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { mockPolicies, monthlyImpactData } from "@/data/mockPolicies";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const TrackerPage = () => {
  const navigate = useNavigate();

  const totalImpact = monthlyImpactData.reduce((acc, m) => acc + m.impact, 0);
  const currentMonthImpact = monthlyImpactData[monthlyImpactData.length - 1].impact;

  // Format data for chart
  const chartData = monthlyImpactData.map((d) => ({
    ...d,
    positive: d.impact >= 0 ? d.impact : 0,
    negative: d.impact < 0 ? d.impact : 0,
  }));

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-medium text-sm">My Impact Tracker</span>
          <Button variant="ghost" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <GlassCard className="p-4" hover={false}>
            <p className="text-xs text-muted-foreground mb-1">This Month</p>
            <p
              className={`font-serif text-2xl md:text-3xl ${
                currentMonthImpact >= 0 ? "impact-positive" : "impact-negative"
              }`}
            >
              {currentMonthImpact >= 0 ? "+" : ""}₹{Math.abs(currentMonthImpact).toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {currentMonthImpact >= 0 ? (
                <TrendingUp className="w-3 h-3 text-chart-2" />
              ) : (
                <TrendingDown className="w-3 h-3 text-chart-1" />
              )}
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </GlassCard>

          <GlassCard className="p-4" hover={false}>
            <p className="text-xs text-muted-foreground mb-1">6 Month Total</p>
            <p
              className={`font-serif text-2xl md:text-3xl ${
                totalImpact >= 0 ? "impact-positive" : "impact-negative"
              }`}
            >
              {totalImpact >= 0 ? "+" : ""}₹{Math.abs(totalImpact).toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Aug - Jan</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard className="p-4 md:p-6" hover={false}>
            <h3 className="text-sm font-medium mb-4">Impact Trend</h3>
            <div className="h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.625rem",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [`₹${value}`, "Impact"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="impact"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    fill="url(#fillPositive)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Policy History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Recent Policies</h3>
            <Link to="/feed">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            {mockPolicies.slice(0, 5).map((policy, index) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Link to={`/result/${policy.id}`}>
                  <GlassCard className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{policy.shortTitle}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {policy.source} • {policy.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span
                          className={`font-serif text-lg ${
                            policy.impactType === "positive"
                              ? "impact-positive"
                              : policy.impactType === "negative"
                              ? "impact-negative"
                              : "text-muted-foreground"
                          }`}
                        >
                          {policy.impact >= 0 ? "+" : ""}₹{Math.abs(policy.impact)}
                        </span>
                        {policy.impactType === "positive" ? (
                          <TrendingUp className="w-4 h-4 text-chart-2" />
                        ) : policy.impactType === "negative" ? (
                          <TrendingDown className="w-4 h-4 text-chart-1" />
                        ) : null}
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TrackerPage;
