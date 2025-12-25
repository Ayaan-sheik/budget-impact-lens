import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, Filter, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { mockPolicies, sources, categories } from "@/data/mockPolicies";

const FeedPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isScanning, setIsScanning] = useState(true);

  const filteredPolicies =
    selectedCategory === "All"
      ? mockPolicies
      : mockPolicies.filter((p) => p.category === selectedCategory);

  const handleRefresh = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-chart-4" />
            <span className="font-medium text-sm">Live Policy Feed</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCw className={`w-5 h-5 ${isScanning ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Live Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <GlassCard className="p-4 relative overflow-hidden" hover={false}>
            {isScanning && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="scanning-beam absolute inset-0" />
              </div>
            )}
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isScanning ? "bg-chart-2 animate-pulse" : "bg-chart-4"}`} />
                <span className="text-sm">
                  {isScanning ? "Scanning for new policies..." : "Feed up to date"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Last updated: Just now
              </span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Categories</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Source Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <span className="text-xs text-muted-foreground mb-3 block">Sources</span>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {sources.map((source) => (
              <div
                key={source.name}
                className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                title={source.fullName}
              >
                <div className="w-6 h-6 rounded bg-muted-foreground/20 group-hover:bg-foreground/20 flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                  {source.name.charAt(0)}
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                  {source.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Policy List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredPolicies.map((policy, index) => (
              <motion.div
                key={policy.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Link to={`/result/${policy.id}`}>
                  <GlassCard className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Impact indicator */}
                      <div
                        className={`mt-1 w-1 h-12 rounded-full ${
                          policy.impactType === "positive"
                            ? "bg-chart-2"
                            : policy.impactType === "negative"
                            ? "bg-chart-1"
                            : "bg-muted-foreground"
                        }`}
                      />

                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex gap-2 mb-2">
                          {policy.isNew && (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-chart-2 text-white rounded">
                              NEW
                            </span>
                          )}
                          {policy.isHot && (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-chart-5 text-white rounded">
                              HOT
                            </span>
                          )}
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded">
                            {policy.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-medium mb-1">{policy.shortTitle}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {policy.description}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {policy.source} • {policy.date}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-serif text-base ${
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
                              <TrendingUp className="w-3 h-3 text-chart-2" />
                            ) : policy.impactType === "negative" ? (
                              <TrendingDown className="w-3 h-3 text-chart-1" />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPolicies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No policies in this category</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedPage;
