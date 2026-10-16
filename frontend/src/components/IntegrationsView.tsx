"use client";

import React, { useState } from "react";
import { 
  Share2, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Globe, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Search
} from "lucide-react";
import { Business } from "@/types";

interface IntegrationsViewProps {
  business: Business;
  isConnected: boolean;
  onConnectDemo: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  business,
  isConnected,
  onConnectDemo,
  onDisconnect
}) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isConnected) {
        await onDisconnect();
      } else {
        await onConnectDemo();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Share2 className="w-4 h-4" />
            <span>Platform Connectors & OAuth Verification</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            External Integrations & API Adapters
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Unified OAuth 2.0 connectors for Google Business Profile, Google Search Console, and Google Gemini LLMs.
          </p>
        </div>
      </div>

      {/* Primary Integration: Google Business Profile */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-lg">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Google Business Profile (GBP)</h3>
                {isConnected ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Connected & Verified</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
                    Disconnected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automate review syncing, post scheduled promotional offers, and update operating hours.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              isConnected
                ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
            } disabled:opacity-50`}
          >
            {loading ? "Updating..." : isConnected ? "Disconnect Profile" : "Connect Verified Profile"}
          </button>
        </div>

        {isConnected && (
          <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account Entity</span>
              <span className="text-white font-medium mt-0.5 block truncate">{business.name} (Verified Google Profile)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sync Frequency</span>
              <span className="text-emerald-400 font-medium mt-0.5 block">Every 6 Hours (Automatic)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">API Credentials Mode</span>
              <span className="text-indigo-300 font-medium mt-0.5 block">Adapter / Live Sync Ready</span>
            </div>
          </div>
        )}
      </div>

      {/* Additional Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Places Engine */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Google Places API</h4>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Adapter
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Powers the local competitor discovery scanner with real-world nearby searches and ranking benchmarking.
          </p>
        </div>

        {/* Gemini LLM Engine */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white">Google Gemini Orchestrator</h4>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              gemini-1.5-flash
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Drives intelligent review sentiment categorization, tone-matched response generation, and strategic growth advice.
          </p>
        </div>
      </div>
    </div>
  );
};
