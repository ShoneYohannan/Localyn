"use client";

import React from "react";
import { 
  TrendingUp, 
  Globe, 
  Users, 
  Star, 
  Smile, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Business, DashboardSummary, WebsiteAudit, Review, AIRecommendation } from "@/types";

interface DashboardViewProps {
  business: Business;
  summary: DashboardSummary | null;
  onNavigateTab: (tab: any) => void;
  onTriggerAudit: () => void;
  onOpenApproval: () => void;
  isAuditing?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  business,
  summary,
  onNavigateTab,
  onTriggerAudit,
  onOpenApproval,
  isAuditing = false
}) => {
  const opportunityScore = summary?.opportunity_score ?? business.opportunity_score ?? 70;
  
  // Score rating color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel bg-gradient-to-r from-[#0f172a] via-[#131c35] to-[#0f172a] border border-white/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Presence & Growth Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {business.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {business.category} • {business.address || `${business.city}, ${business.state}`} • Target: {business.target_keywords?.slice(0, 3).join(", ") || "Local search dominance"}
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={onTriggerAudit}
            disabled={isAuditing}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isAuditing ? "animate-spin" : ""}`} />
            <span>{isAuditing ? "Auditing Website..." : "Run Tech SEO Audit"}</span>
          </button>
          
          <button
            onClick={() => onNavigateTab("automations")}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10 text-xs font-medium transition-all"
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>View Automations</span>
          </button>
        </div>

        {/* Ambient subtle background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Hero: Opportunity Scoring Engine Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Opportunity Score Gauge Card */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Opportunity Score
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Rule-Based Engine
              </span>
            </div>

            <div className="flex items-center space-x-5 my-2">
              <div className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center font-black ${getScoreColor(opportunityScore)} shadow-xl`}>
                <span className="text-4xl tracking-tighter leading-none">{opportunityScore}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-70">/ 100</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">
                  {opportunityScore >= 80 ? "Optimal Local Visibility" : opportunityScore >= 60 ? "Strong Growth Potential" : "High Opportunity Gap"}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Calculated across website technical health, review sentiment, local schema readiness, and competitor saturation.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Last computed: Real-time</span>
            <button 
              onClick={() => onNavigateTab("audit")} 
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
            >
              <span>Audit details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Opportunity Score Sub-Factors */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Scoring Factor Breakdown
            </span>
            <span className="text-xs text-slate-400">Weighted evaluation formula</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Factor 1: Technical Health */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Website Health (25%)</span>
                </span>
                <span className="font-bold text-white">{summary?.website_health_score || 82} / 100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full" 
                  style={{ width: `${summary?.website_health_score || 82}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">Response time, meta tags, schema markup & mobile LCP</p>
            </div>

            {/* Factor 2: Profile Completeness */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Profile Completeness (20%)</span>
                </span>
                <span className="font-bold text-white">100%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `100%` }} />
              </div>
              <p className="text-[10px] text-slate-400">NAP consistency, categories, keywords, and operating hours</p>
            </div>

            {/* Factor 3: Review Sentiment */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>Review Sentiment (25%)</span>
                </span>
                <span className="font-bold text-white">{summary?.positive_sentiment_percent || 75}% Pos</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full" 
                  style={{ width: `${summary?.positive_sentiment_percent || 75}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">{summary?.total_reviews || 4} total reviews • {summary?.average_rating || 4.2} avg stars</p>
            </div>

            {/* Factor 4: Competitor Gap */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Competitor Gap (20%)</span>
                </span>
                <span className="font-bold text-white">Moderate</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `65%` }} />
              </div>
              <p className="text-[10px] text-slate-400">{summary?.total_competitors || 3} tracked competitors in 5km radius</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Technical SEO */}
        <div 
          onClick={() => onNavigateTab("audit")}
          className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Website Health</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{summary?.website_health_score || 82}</span>
            <span className="text-xs text-emerald-400 font-semibold">+6 pts vs avg</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Lighthouse SEO & Speed score</p>
        </div>

        {/* KPI 2: Competitor Count */}
        <div 
          onClick={() => onNavigateTab("competitors")}
          className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Direct Competitors</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{summary?.total_competitors || 3}</span>
            <span className="text-xs text-indigo-400 font-semibold">Active scan</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Benchmarked via Google Places</p>
        </div>

        {/* KPI 3: Review Rating */}
        <div 
          onClick={() => onNavigateTab("reviews")}
          className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Review Rating</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{summary?.average_rating || 4.2}</span>
            <span className="text-xs text-slate-400">★ ({summary?.total_reviews || 4} total)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Google Business Profile stream</p>
        </div>

        {/* KPI 4: Pending Safety Approvals */}
        <div 
          onClick={() => onNavigateTab("automations")}
          className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Safety Approvals</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{summary?.pending_approvals_count ?? 1}</span>
            <span className="text-xs text-amber-400 font-semibold">Awaiting human review</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Human-in-the-loop safety queue</p>
        </div>
      </div>

      {/* AI Growth Recommendations & Priority Action Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white">AI-Recommended Action Queue</h2>
          </div>
          <span className="text-xs text-slate-400">Prioritized by revenue impact & ease</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary?.top_recommendations?.map((rec: any, idx: number) => (
            <div 
              key={rec.id || idx}
              className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/50 flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    rec.priority === "high" 
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" 
                      : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {rec.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {rec.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="text-[11px] text-indigo-300 font-medium">
                  → {rec.suggested_action || "Execute recommendation"}
                </div>
                <button
                  onClick={() => {
                    if (rec.category === "seo") onNavigateTab("audit");
                    else if (rec.category === "reviews") onNavigateTab("reviews");
                    else if (rec.category === "gbp") onNavigateTab("automations");
                    else onNavigateTab("dashboard");
                  }}
                  className="w-full py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                >
                  <span>Take Action</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )) || (
            <div className="col-span-3 text-center py-8 text-slate-400 text-xs">
              No recommendations generated yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
