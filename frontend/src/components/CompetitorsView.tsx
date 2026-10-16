"use client";

import React, { useState } from "react";
import { 
  Users, 
  Star, 
  MapPin, 
  Search, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { Competitor, Business } from "@/types";

interface CompetitorsViewProps {
  business: Business;
  competitors: Competitor[];
  onDiscoverCompetitors: (category: string, location: string, radius: number) => void;
  isDiscovering: boolean;
}

export const CompetitorsView: React.FC<CompetitorsViewProps> = ({
  business,
  competitors,
  onDiscoverCompetitors,
  isDiscovering
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchCategory, setSearchCategory] = useState(business.category || "Dentist");
  const [searchLocation, setSearchLocation] = useState(business.city ? `${business.city}, ${business.state}` : "Chicago, IL");
  const [searchRadius, setSearchRadius] = useState(5000);

  const avgCompRating = competitors.length > 0
    ? (competitors.reduce((acc, c) => acc + c.rating, 0) / competitors.length).toFixed(1)
    : "0.0";

  const totalCompReviews = competitors.reduce((acc, c) => acc + c.review_count, 0);

  const handleDiscoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDiscoverCompetitors(searchCategory, searchLocation, searchRadius);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Scanner Controls */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Google Places Competitive Intelligence</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Local Pack Competitor Benchmarks
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track and reverse-engineer ranking signals, review volume, and sentiment gaps in your local radius.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={isDiscovering}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all shrink-0 active:scale-95 disabled:opacity-50"
        >
          <Search className={`w-3.5 h-3.5 ${isDiscovering ? "animate-spin" : ""}`} />
          <span>{isDiscovering ? "Scanning Places..." : "Discover Nearby Competitors"}</span>
        </button>
      </div>

      {/* Benchmark Stat Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40">
          <span className="text-xs font-semibold text-slate-400">Tracked Direct Competitors</span>
          <div className="mt-2 text-3xl font-bold text-white">{competitors.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Within 5 km radius</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40">
          <span className="text-xs font-semibold text-slate-400">Market Average Rating</span>
          <div className="mt-2 text-3xl font-bold text-amber-400 flex items-center space-x-1">
            <span>{avgCompRating}</span>
            <span className="text-base text-slate-400">★</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{totalCompReviews} aggregate customer reviews</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/40">
          <span className="text-xs font-semibold text-slate-400">Local Market Saturation</span>
          <div className="mt-2 text-3xl font-bold text-indigo-400">Moderate</div>
          <p className="text-[11px] text-slate-400 mt-1">High opportunity in review response speed</p>
        </div>
      </div>

      {/* Competitor Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Direct Market Competitors</h3>
          <span className="text-xs text-slate-400">Ranked by local pack dominance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map((comp) => (
            <div
              key={comp.id}
              className="p-5 rounded-2xl glass-panel border border-white/10 bg-slate-900/50 flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">{comp.name}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="truncate">{comp.address || "Local downtown listing"}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold shrink-0">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{comp.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-200">{comp.review_count}</span> verified reviews • <span className="font-semibold text-slate-200">{comp.distance_km || 0.4} km</span> away
                </div>

                {/* Strengths */}
                {comp.strengths?.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Observed Strengths:</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {comp.strengths.map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weaknesses / Opportunities */}
                {comp.weaknesses?.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1">
                      <XCircle className="w-3 h-3" />
                      <span>Exploitable Gaps:</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {comp.weaknesses.map((w, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Google Places Verified</span>
                <span className="text-indigo-400 font-medium">Ranked #{(competitors.indexOf(comp) + 1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discovery Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl glass-panel bg-[#0f172a] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Search className="w-4 h-4 text-indigo-400" />
                <span>Google Places Discovery</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDiscoverSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Business Category</label>
                <input
                  type="text"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">City / Market Location</label>
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Search Radius (meters)</label>
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value={2000}>2 km (Immediate neighborhood)</option>
                  <option value={5000}>5 km (Standard metro radius)</option>
                  <option value={10000}>10 km (Extended regional)</option>
                </select>
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDiscovering}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
                >
                  {isDiscovering ? "Scanning..." : "Execute Scan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
