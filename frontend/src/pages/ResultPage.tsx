import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Bookmark, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { mockPolicies } from "@/data/mockPolicies";

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const policy = mockPolicies.find((p) => p.id === id) || mockPolicies[0];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
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
        {/* Policy Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">{policy.source}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{policy.date}</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-normal leading-tight">
            {policy.title}
          </h1>
        </motion.div>

        {/* Main Impact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <GlassCard className="p-6 md:p-8 mb-6" hover={false}>
            <p className="text-sm text-muted-foreground mb-2">
              Your Monthly Impact
            </p>
            <div className="flex items-center gap-4">
              <span
                className={`font-serif text-5xl md:text-6xl ${
                  policy.impactType === "positive"
                    ? "impact-positive"
                    : policy.impactType === "negative"
                    ? "impact-negative"
                    : "text-foreground"
                }`}
              >
                {policy.impact >= 0 ? "+" : ""}₹{Math.abs(policy.impact).toLocaleString()}
              </span>
              {policy.impactType === "positive" ? (
                <TrendingUp className="w-8 h-8 text-chart-2" />
              ) : policy.impactType === "negative" ? (
                <TrendingDown className="w-8 h-8 text-chart-1" />
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {policy.impactType === "positive"
                ? "This policy is expected to save you money"
                : policy.impactType === "negative"
                ? "This policy may increase your expenses"
                : "This policy has neutral financial impact for you"}
            </p>
          </GlassCard>
        </motion.div>

        {/* Impact Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-lg font-medium mb-4">Impact Breakdown</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <GlassCard className="p-4" hover={false}>
              <p className="text-sm text-muted-foreground mb-1">Direct Impact</p>
              <p className={`font-serif text-2xl ${policy.details.directImpact >= 0 ? "impact-positive" : "impact-negative"}`}>
                {policy.details.directImpact >= 0 ? "+" : ""}₹{Math.abs(policy.details.directImpact).toLocaleString()}
              </p>
            </GlassCard>
            <GlassCard className="p-4" hover={false}>
              <p className="text-sm text-muted-foreground mb-1">Indirect Impact</p>
              <p className={`font-serif text-2xl ${policy.details.indirectImpact >= 0 ? "impact-positive" : "impact-negative"}`}>
                {policy.details.indirectImpact >= 0 ? "+" : ""}₹{Math.abs(policy.details.indirectImpact).toLocaleString()}
              </p>
            </GlassCard>
          </div>
        </motion.div>

        {/* Key Factors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-lg font-medium mb-4">Key Factors</h2>
          <div className="space-y-2">
            {policy.details.factors.map((factor, index) => (
              <GlassCard key={index} className="p-4" hover={false}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{factor.label}</span>
                  <span
                    className={`font-serif text-lg ${
                      factor.amount >= 0 ? "impact-positive" : "impact-negative"
                    }`}
                  >
                    {factor.amount >= 0 ? "+" : ""}₹{Math.abs(factor.amount).toLocaleString()}
                  </span>
                </div>
                {/* Simple bar visualization */}
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      factor.amount >= 0 ? "bg-chart-2" : "bg-chart-1"
                    }`}
                    style={{
                      width: `${Math.min(Math.abs(factor.amount) / 4, 100)}%`,
                    }}
                  />
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* View Full Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Link to={`/breakdown/${policy.id}`}>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">View Full Breakdown</p>
                  <p className="text-sm text-muted-foreground">
                    Category analysis, affected regions & more
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </GlassCard>
          </Link>
        </motion.div>

        {/* Affected States */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-6"
        >
          <h2 className="text-lg font-medium mb-4">Affected Regions</h2>
          <div className="flex flex-wrap gap-2">
            {policy.affectedStates.map((state) => (
              <span
                key={state}
                className="px-3 py-1 text-sm bg-muted rounded-full"
              >
                {state}
              </span>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ResultPage;
