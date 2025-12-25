import { motion } from "framer-motion";
import { Camera, TrendingUp, TrendingDown, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { mockPolicies } from "@/data/mockPolicies";

const HomePage = () => {
  const trendingPolicies = mockPolicies.slice(0, 3);
  const totalMonthlyImpact = 847;

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <section className="px-4 pt-12 pb-8 md:pt-20 md:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-normal leading-tight mb-6">
            Understand how policies affect{" "}
            <span className="italic">YOUR</span> money
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Scan any headline, get instant impact analysis on your personal finances
          </p>

          {/* Main CTA */}
          <Link to="/scan">
            <Button
              size="lg"
              className="h-14 px-8 text-lg gap-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Camera className="w-5 h-5" />
              Scan a Headline
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Monthly Impact Summary */}
      <section className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <GlassCard className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">This Month's Impact</p>
                <p className="font-serif text-3xl md:text-4xl impact-positive">
                  +₹{totalMonthlyImpact.toLocaleString()}
                </p>
              </div>
              <Link to="/tracker">
                <Button variant="ghost" size="sm" className="gap-2">
                  View Details <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Trending Policies */}
      <section className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-chart-4" />
              <h2 className="text-lg font-medium">Trending Policies</h2>
            </div>
            <Link to="/feed">
              <Button variant="ghost" size="sm">
                See All
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {trendingPolicies.map((policy, index) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              >
                <Link to={`/result/${policy.id}`}>
                  <GlassCard className="p-4 h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2">
                        {policy.isNew && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-chart-2 text-white rounded">
                            NEW
                          </span>
                        )}
                        {policy.isHot && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-chart-5 text-white rounded">
                            HOT
                          </span>
                        )}
                      </div>
                      {policy.impactType === "positive" ? (
                        <TrendingUp className="w-4 h-4 text-chart-2" />
                      ) : policy.impactType === "negative" ? (
                        <TrendingDown className="w-4 h-4 text-chart-1" />
                      ) : null}
                    </div>

                    <h3 className="font-medium text-sm mb-2 line-clamp-2">
                      {policy.shortTitle}
                    </h3>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {policy.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {policy.source}
                      </span>
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
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/scan">
              <GlassCard className="p-4 text-center">
                <Camera className="w-6 h-6 mx-auto mb-2 text-foreground" />
                <p className="text-sm font-medium">Scan</p>
              </GlassCard>
            </Link>
            <Link to="/tracker">
              <GlassCard className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-foreground" />
                <p className="text-sm font-medium">Tracker</p>
              </GlassCard>
            </Link>
            <Link to="/feed">
              <GlassCard className="p-4 text-center">
                <Zap className="w-6 h-6 mx-auto mb-2 text-foreground" />
                <p className="text-sm font-medium">Live Feed</p>
              </GlassCard>
            </Link>
            <Link to="/profile">
              <GlassCard className="p-4 text-center">
                <div className="w-6 h-6 mx-auto mb-2 rounded-full bg-primary" />
                <p className="text-sm font-medium">Profile</p>
              </GlassCard>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
