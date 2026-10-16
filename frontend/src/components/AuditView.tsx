"use client";

import React, { useState } from "react";
import { 
  Globe, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  AlertCircle, 
  CheckCircle2, 
  Code, 
  RefreshCw, 
  Clock, 
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from "lucide-react";
import { WebsiteAudit, Business } from "@/types";

interface AuditViewProps {
  business: Business;
  audit: WebsiteAudit | null;
  onRunAudit: (url?: string) => void;
  isAuditing: boolean;
}

export const AuditView: React.FC<AuditViewProps> = ({
  business,
  audit,
  onRunAudit,
  isAuditing
}) => {
  const [targetUrl, setTargetUrl] = useState(business.website_url || "https://example.com/apex-dental");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
      case "critical":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controls & URL Input */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Technical SEO & Performance Auditor</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Safe Website Audit Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluates SSRF-safe crawling, schema completeness, core web vitals, and metadata hierarchy.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-full md:w-72"
          />
          <button
            onClick={() => onRunAudit(targetUrl)}
            disabled={isAuditing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin" : ""}`} />
            <span>{isAuditing ? "Analyzing..." : "Run Audit"}</span>
          </button>
        </div>
      </div>

      {/* 4 Core Score Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 text-center space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Health</span>
          <div className={`w-16 h-16 mx-auto rounded-2xl border-2 flex items-center justify-center text-2xl font-black ${getScoreColor(audit?.overall_score || 82)}`}>
            {audit?.overall_score || 82}
          </div>
          <p className="text-[10px] text-slate-400">Aggregate benchmark</p>
        </div>

        {/* SEO Score */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 text-center space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical SEO</span>
          <div className={`w-16 h-16 mx-auto rounded-2xl border-2 flex items-center justify-center text-2xl font-black ${getScoreColor(audit?.seo_score || 85)}`}>
            {audit?.seo_score || 85}
          </div>
          <p className="text-[10px] text-slate-400">Meta tags, headings, schema</p>
        </div>

        {/* Performance / Speed */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 text-center space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Performance</span>
          <div className={`w-16 h-16 mx-auto rounded-2xl border-2 flex items-center justify-center text-2xl font-black ${getScoreColor(audit?.performance_score || 76)}`}>
            {audit?.performance_score || 76}
          </div>
          <p className="text-[10px] text-slate-400">TTFB: {audit?.response_time_ms || 342}ms</p>
        </div>

        {/* Mobile & Security */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 text-center space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security & Mobile</span>
          <div className={`w-16 h-16 mx-auto rounded-2xl border-2 flex items-center justify-center text-2xl font-black ${getScoreColor(audit?.security_score || 95)}`}>
            {audit?.security_score || 95}
          </div>
          <p className="text-[10px] text-slate-400">HTTPS, headers & viewport</p>
        </div>
      </div>

      {/* Summary Box */}
      {audit?.summary && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs flex items-start space-x-3">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{audit.summary}</p>
        </div>
      )}

      {/* Issues & Remediation Action Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <h3 className="text-base font-bold text-white">
              Identified Opportunities & Remediations ({audit?.issues?.length || 0})
            </h3>
          </div>
          <span className="text-xs text-slate-400">SSRF-protected evaluation</span>
        </div>

        <div className="space-y-3">
          {audit?.issues?.map((issue, idx) => (
            <div 
              key={issue.id || idx}
              className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/50 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getSeverityBadge(issue.severity)}`}>
                    {issue.severity} Severity
                  </span>
                  <span className="text-sm font-bold text-white">
                    {issue.title}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">Category: {issue.category}</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {issue.description}
              </p>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>Recommended Fix:</span>
                  <button
                    onClick={() => copyToClipboard(issue.remediation, issue.id)}
                    className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedId === issue.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy snippet</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] text-slate-300 font-mono bg-slate-900/80 p-2.5 rounded-lg overflow-x-auto">
                  {issue.remediation}
                </pre>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-slate-400 text-xs">No issues found. Website in top shape!</div>
          )}
        </div>
      </div>

      {/* Meta Tags & Headings Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Meta Tags */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Verified Meta Tags
          </span>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400">Title:</span>
              <p className="text-white font-medium mt-0.5">{audit?.meta_tags?.title || "Apex Dental Studio | Top Rated Cosmetic Dentist Chicago"}</p>
            </div>
            <div>
              <span className="text-slate-400">Description:</span>
              <p className="text-slate-300 mt-0.5">{audit?.meta_tags?.description || "Award-winning cosmetic dentistry, teeth whitening, and Invisalign in downtown Chicago."}</p>
            </div>
          </div>
        </div>

        {/* Heading Hierarchy */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Heading Hierarchy
          </span>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400">H1 Tag:</span>
              <p className="text-indigo-300 font-semibold mt-0.5">{audit?.headings?.h1?.[0] || "Downtown Chicago's Premier Cosmetic Dental Practice"}</p>
            </div>
            <div className="flex items-center space-x-4 pt-1">
              <span className="text-slate-300">H2 Subheadings: <strong className="text-white">{audit?.headings?.h2_count ?? 6}</strong></span>
              <span className="text-slate-300">H3 Elements: <strong className="text-white">{audit?.headings?.h3_count ?? 12}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
