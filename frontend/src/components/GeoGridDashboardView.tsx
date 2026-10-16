"use client";

import React, { useState } from "react";
import { 
  Star, 
  MapPin, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Camera, 
  FileText, 
  ArrowUpRight, 
  TrendingUp, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  Folder,
  SlidersHorizontal,
  BarChart3,
  MessageSquare,
  Search,
  Layers,
  Globe2
} from "lucide-react";
import { Business, DashboardSummary, Review, WebsiteAudit, Competitor, AutomationJob, ApprovalRequest } from "@/types";

interface GeoGridDashboardViewProps {
  business: Business;
  summary: DashboardSummary | null;
  reviews: Review[];
  audit: WebsiteAudit | null;
  competitors: Competitor[];
  approvals: ApprovalRequest[];
  onOpenAudit: () => void;
  onOpenCompetitors: () => void;
  onOpenReviews: () => void;
  onOpenAutomations: () => void;
  onOpenIntegrations: () => void;
  onTriggerAudit: () => void;
  onOpenOnboarding: () => void;
}

export const GeoGridDashboardView: React.FC<GeoGridDashboardViewProps> = ({
  business,
  summary,
  reviews,
  audit,
  competitors,
  approvals,
  onOpenAudit,
  onOpenCompetitors,
  onOpenReviews,
  onOpenAutomations,
  onOpenIntegrations,
  onTriggerAudit,
  onOpenOnboarding
}) => {
  // Geo-grid selected keyword
  const keywords = business.target_keywords?.length > 0
    ? business.target_keywords
    : ["cosmetic dentist chicago", "teeth whitening downtown", "invisalign loop", "emergency dental"];

  const [selectedKeyword, setSelectedKeyword] = useState(keywords[0]);
  const [showKeywordMenu, setShowKeywordMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>("local");
  const [hoveredPin, setHoveredPin] = useState<any | null>(null);

  // Profile strength sliders state
  const [slider1, setSlider1] = useState(91);
  const [slider2, setSlider2] = useState(69);
  const [slider3, setSlider3] = useState(69);
  const [slider4, setSlider4] = useState(59);

  // Geo-grid simulated pins based on selected keyword
  const getPinsForKeyword = (kw: string) => {
    if (kw.includes("whitening")) {
      return [
        { id: 1, x: 38, y: 32, rank: 1, color: "#10b981", area: "Michigan Ave Core" },
        { id: 2, x: 48, y: 28, rank: 2, color: "#10b981", area: "Streeterville" },
        { id: 3, x: 56, y: 35, rank: 3, color: "#10b981", area: "Navy Pier Corridor" },
        { id: 4, x: 34, y: 46, rank: 2, color: "#10b981", area: "Loop North" },
        { id: 5, x: 45, y: 45, rank: 1, color: "#10b981", area: "Downtown Flagship" },
        { id: 6, x: 58, y: 48, rank: 4, color: "#06b6d4", area: "Lakeshore East" },
        { id: 7, x: 30, y: 62, rank: 5, color: "#06b6d4", area: "Fulton River" },
        { id: 8, x: 42, y: 60, rank: 6, color: "#f97316", area: "Millennium Park" },
        { id: 9, x: 54, y: 64, rank: 8, color: "#f97316", area: "Grant Park North" },
        { id: 10, x: 48, y: 76, rank: 11, color: "#ef4444", area: "South Loop Hub" },
      ];
    }
    if (kw.includes("invisalign")) {
      return [
        { id: 1, x: 35, y: 35, rank: 3, color: "#10b981", area: "Gold Coast" },
        { id: 2, x: 46, y: 30, rank: 2, color: "#10b981", area: "Streeterville" },
        { id: 3, x: 55, y: 36, rank: 4, color: "#06b6d4", area: "Magnificent Mile" },
        { id: 4, x: 44, y: 44, rank: 1, color: "#10b981", area: "Downtown Flagship" },
        { id: 5, x: 52, y: 46, rank: 3, color: "#10b981", area: "River North" },
        { id: 6, x: 38, y: 55, rank: 5, color: "#06b6d4", area: "Loop Central" },
        { id: 7, x: 48, y: 58, rank: 6, color: "#f97316", area: "Art Institute Zone" },
        { id: 8, x: 60, y: 62, rank: 9, color: "#f97316", area: "Lakeshore South" },
      ];
    }
    // Default: cosmetic dentist chicago
    return [
      { id: 1, x: 32, y: 30, rank: 2, color: "#10b981", area: "River North West" },
      { id: 2, x: 42, y: 26, rank: 1, color: "#10b981", area: "Near North Side" },
      { id: 3, x: 50, y: 32, rank: 2, color: "#10b981", area: "Streeterville Central" },
      { id: 4, x: 62, y: 34, rank: 4, color: "#06b6d4", area: "Magnificent Mile" },
      { id: 5, x: 36, y: 45, rank: 3, color: "#10b981", area: "River North Central" },
      { id: 6, x: 46, y: 43, rank: 1, color: "#10b981", area: "Apex Dental (Origin)" },
      { id: 7, x: 54, y: 46, rank: 3, color: "#10b981", area: "Water Tower Hub" },
      { id: 8, x: 40, y: 56, rank: 5, color: "#06b6d4", area: "The Loop North" },
      { id: 9, x: 48, y: 58, rank: 6, color: "#f97316", area: "Financial District" },
      { id: 10, x: 58, y: 56, rank: 7, color: "#f97316", area: "Millennium Station" },
      { id: 11, x: 44, y: 70, rank: 9, color: "#f97316", area: "South Loop Central" },
      { id: 12, x: 56, y: 68, rank: 12, color: "#ef4444", area: "Museum Campus" },
    ];
  };

  const currentPins = getPinsForKeyword(selectedKeyword);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 3-Column Dashboard Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ========================================================= */}
        {/* COLUMN 1: LEFT SUB-SIDEBAR (col-span-3)                    */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Menu / Nav Card */}
          <div className="rounded-2xl bg-[#111724] border border-[#1e2638] p-3 space-y-1 shadow-xl">
            {/* Orange Status Indicator Dot */}
            <div className="px-3 pt-1 pb-2 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-md shadow-orange-500/50 animate-pulse" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Local SEO Suite</span>
            </div>

            {/* Menu Items */}
            {[
              { id: "ranking", label: "Ranking", icon: TrendingUp, hasChevron: true },
              { id: "metrics", label: "Metrics", icon: BarChart3, hasChevron: true },
              { id: "local", label: "Local Pack", icon: MapPin, hasChevron: true, active: true },
              { id: "tracking", label: "Tracking", icon: Layers, hasChevron: true },
              { id: "reporting", label: "Reporting", icon: Globe2, hasChevron: true },
              { id: "benchmarks", label: "Benchmarks", icon: SlidersHorizontal, hasChevron: false },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  if (item.id === "benchmarks") onOpenCompetitors();
                  else if (item.id === "reporting") onOpenAudit();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  item.active || activeMenu === item.id
                    ? "bg-[#1c2436] text-white shadow-inner border border-white/5"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <item.icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </div>
                {item.hasChevron && <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </button>
            ))}
          </div>

          {/* Local Citations Card */}
          <div className="rounded-2xl bg-[#111724] border border-[#1e2638] p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white tracking-wide">Local Citations</h3>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Live Sync
              </span>
            </div>

            <div className="divide-y divide-white/5 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-2">
                  <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Directories</span>
                </span>
                <span className="font-semibold text-emerald-400">10 live</span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Status</span>
                </span>
                <span className="font-semibold text-white">Active</span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pending</span>
                </span>
                <span className="font-bold text-white">35</span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Synced</span>
                </span>
                <span className="font-bold text-white">30</span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Errors</span>
                </span>
                <span className="font-bold text-rose-400">11</span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Listed</span>
                </span>
                <span className="font-bold text-white">20</span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sites</span>
                </span>
                <span className="font-bold text-white">10</span>
              </div>
            </div>

            <button
              onClick={onOpenAudit}
              className="w-full mt-2 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
            >
              <span>Audit All Citations</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: CENTER BROAD CONTENT (col-span-6)               */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Main Geo-Grid Heatmap Rank Tracker Card */}
          <div className="rounded-2xl bg-[#111724] border border-[#1e2638] p-4 space-y-3 shadow-xl relative overflow-hidden">
            
            {/* Top Card Controls */}
            <div className="flex items-center justify-between z-10 relative">
              {/* Keyword Selector Pill with Orange Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowKeywordMenu(!showKeywordMenu)}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#0b0e17] hover:bg-[#161c2b] border border-white/10 text-xs font-semibold text-white transition-all shadow-md"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
                  <span className="truncate max-w-[200px]">{selectedKeyword}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showKeywordMenu && (
                  <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#0f172a] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in duration-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Target Keywords</div>
                    {keywords.map((kw) => (
                      <button
                        key={kw}
                        onClick={() => {
                          setSelectedKeyword(kw);
                          setShowKeywordMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                          selectedKeyword === kw ? "bg-orange-500/20 text-orange-300 font-bold" : "text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Map Actions */}
              <div className="flex items-center space-x-2">
                <div className="px-2.5 py-1 rounded-lg bg-[#0b0e17] border border-white/10 text-[11px] font-semibold text-slate-300 flex items-center space-x-1">
                  <span>Geo-Grid 5x5</span>
                </div>
                <button
                  onClick={() => {}}
                  title="Refresh Grid Rank"
                  className="p-1.5 rounded-lg bg-[#0b0e17] hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Realistic Google Map Grid Graphic Surface */}
            <div className="relative w-full h-80 rounded-xl overflow-hidden border border-white/5 bg-[#172033] shadow-inner select-none">
              
              {/* Map Tile Layer Graphic */}
              <div className="absolute inset-0 bg-[#e5e3df] dark:bg-[#1a2130] opacity-90">
                {/* Street grid patterns */}
                <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="streets" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2c374d" strokeWidth="2" />
                      <path d="M 30 0 L 30 60 M 0 30 L 60 30" fill="none" stroke="#232d40" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#streets)" />
                </svg>

                {/* Lake Michigan / Water shape on right side */}
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-[#10233d]/70 border-l border-cyan-500/20" />
                <span className="absolute right-4 top-1/2 -rotate-90 text-[10px] font-bold text-cyan-400/40 uppercase tracking-widest pointer-events-none">
                  Lake Michigan
                </span>
              </div>

              {/* Color-zoned Quadrants (Heatmap Transparency Overlay) */}
              <div className="absolute inset-4 grid grid-cols-3 grid-rows-3 opacity-35 pointer-events-none rounded-xl overflow-hidden">
                <div className="bg-emerald-500/20 border border-emerald-500/20" />
                <div className="bg-emerald-500/30 border border-emerald-500/20" />
                <div className="bg-cyan-500/20 border border-cyan-500/20" />
                <div className="bg-emerald-500/25 border border-emerald-500/20" />
                <div className="bg-emerald-500/40 border border-emerald-500/30 shadow-inner" />
                <div className="bg-orange-500/25 border border-orange-500/20" />
                <div className="bg-cyan-500/20 border border-cyan-500/20" />
                <div className="bg-orange-500/30 border border-orange-500/20" />
                <div className="bg-rose-500/25 border border-rose-500/20" />
              </div>

              {/* Interactive Ranking Pins */}
              {currentPins.map((pin) => (
                <div
                  key={pin.id}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  onMouseEnter={() => setHoveredPin(pin)}
                  onMouseLeave={() => setHoveredPin(null)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white shadow-xl border-2 border-white/80 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: pin.color }}
                  >
                    {pin.rank}
                  </div>
                  {/* Pin stem */}
                  <div className="w-1 h-1.5 mx-auto bg-white/80 shadow-sm" />
                </div>
              ))}

              {/* Pin Tooltip */}
              {hoveredPin && (
                <div 
                  style={{ left: `${hoveredPin.x}%`, top: `${hoveredPin.y - 12}%` }}
                  className="absolute z-30 transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl bg-slate-950/95 border border-white/20 text-white text-[11px] shadow-2xl whitespace-nowrap pointer-events-none"
                >
                  <div className="font-bold text-emerald-400">Google Rank #{hoveredPin.rank}</div>
                  <div className="text-slate-300 text-[10px]">{hoveredPin.area}</div>
                  <div className="text-slate-400 text-[9px] mt-0.5">Keyword: {selectedKeyword}</div>
                </div>
              )}

              {/* Google Watermark Branding (Bottom Left) */}
              <div className="absolute left-3 bottom-2.5 z-10 flex items-center space-x-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold text-white/90">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
                <span className="text-slate-400 text-[9px] ml-1 font-normal">Maps Grid</span>
              </div>

              {/* Legend Bottom Right */}
              <div className="absolute right-3 bottom-2.5 z-10 flex items-center space-x-2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px]">
                <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>#1-3</span>
                </span>
                <span className="flex items-center space-x-1 text-cyan-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span>#4-5</span>
                </span>
                <span className="flex items-center space-x-1 text-orange-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>#6-10</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Split Row: Profile Strength & GBP Optimization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Bottom Card: Profile Strength / Node Suggestion */}
            <div className="rounded-2xl bg-[#111724] border border-[#1e2638] p-4 flex flex-col justify-between space-y-3 shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <h4 className="text-xs font-bold text-white">Profile Strength</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">91% Optimal</span>
                </div>

                {/* Progress Sliders matching screenshot */}
                <div className="space-y-2 mt-2">
                  {/* Slider 1: 91 Green */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span>Google Profile Completeness</span>
                      <span className="text-emerald-400">{slider1}%</span>
                    </div>
                    <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${slider1}%` }} />
                    </div>
                  </div>

                  {/* Slider 2: 69 Yellow */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span>Citation NAP Consistency</span>
                      <span className="text-amber-400">{slider2}%</span>
                    </div>
                    <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{ width: `${slider2}%` }} />
                    </div>
                  </div>

                  {/* Slider 3: 69 Orange */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span>Technical SEO Readiness</span>
                      <span className="text-orange-400">{slider3}%</span>
                    </div>
                    <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" style={{ width: `${slider3}%` }} />
                    </div>
                  </div>

                  {/* Slider 4: 59 Coral */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span>Review Response Velocity</span>
                      <span className="text-rose-400">{slider4}%</span>
                    </div>
                    <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full" style={{ width: `${slider4}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Blue CTA Button */}
              <button
                onClick={onOpenAudit}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                2 Add New Citations
              </button>
            </div>

            {/* Right Bottom Card: Google Business Profile Optimization */}
            <div className="rounded-2xl bg-[#111724] border border-[#1e2638] p-4 flex flex-col justify-between space-y-3 shadow-xl">
              <div>
                <h4 className="text-xs font-bold text-white">Google Business Profile Optimization</h4>
                
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Progress Tips</span>
                  {/* Circular action badges from screenshot */}
                  <div className="flex items-center space-x-2">
                    <div 
                      onClick={onOpenAutomations}
                      title="Gated Promotional Post Scheduled" 
                      className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div 
                      onClick={onOpenIntegrations}
                      title="Photo Optimization Active" 
                      className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0b0e17] border border-white/5 mt-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    High-Impact Actionable Tip:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Upload 3 high-res clinic photos & approve the pending Spring Whitening offer to increase mobile calls by +28%.
                  </p>
                </div>
              </div>

              {/* Blue CTA Button */}
              <button
                onClick={onOpenAutomations}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                Add New Citations
              </button>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: RIGHT KPI & REVIEW WIDGETS (col-span-3)          */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Card 1: Review Management (Dual 5-Star Displays) */}
          <div className="rounded-2xl bg-[#111724] border border-[#1e2638] p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white tracking-wide">Review Management</h3>
              <span className="text-[10px] text-slate-400">Google Stream</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Star group 1 */}
              <div className="p-2.5 rounded-xl bg-[#0b0e17] border border-white/5 space-y-1">
                <div className="flex text-amber-400 text-xs">
                  {"★★★★★"}
                </div>
                <div className="text-xs font-bold text-white">190 verified</div>
                <div className="text-[10px] text-slate-400 leading-tight">Total reviews</div>
              </div>

              {/* Star group 2 */}
              <div className="p-2.5 rounded-xl bg-[#0b0e17] border border-white/5 space-y-1">
                <div className="flex text-amber-400 text-xs">
                  {"★★★★★"}
                </div>
                <div className="text-xs font-bold text-white">78 new</div>
                <div className="text-[10px] text-emerald-400 leading-tight">+14% velocity</div>
              </div>
            </div>
          </div>

          {/* Card 2: Monthly View / Health View (Spline + Bar Chart) */}
          <div className="rounded-2xl bg-[#111724] border border-[#1e2638] p-4 space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white tracking-wide">Health View</h3>
              <span className="text-[10px] text-cyan-400 font-semibold">120 Max</span>
            </div>

            {/* Custom SVG Line & Bar Chart matching screenshot */}
            <div className="w-full h-28 relative pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 90">
                {/* Background vertical subtle bars matching screenshot */}
                <rect x="10" y="55" width="6" height="30" rx="3" fill="#1e2c45" />
                <rect x="35" y="45" width="6" height="40" rx="3" fill="#1e2c45" />
                <rect x="60" y="30" width="6" height="55" rx="3" fill="#1e2c45" />
                <rect x="85" y="15" width="6" height="70" rx="3" fill="#0ea5e9" opacity="0.6" />
                <rect x="110" y="35" width="6" height="50" rx="3" fill="#1e2c45" />
                <rect x="135" y="25" width="6" height="60" rx="3" fill="#0ea5e9" opacity="0.7" />
                <rect x="160" y="40" width="6" height="45" rx="3" fill="#1e2c45" />
                <rect x="185" y="50" width="6" height="35" rx="3" fill="#1e2c45" />

                {/* Spline Wave Line Chart with glowing cyan stroke */}
                <path
                  d="M 10 70 Q 35 60, 60 45 T 85 20 T 110 40 T 135 15 T 160 38 T 185 55"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Data points */}
                <circle cx="85" cy="20" r="3.5" fill="#38bdf8" />
                <circle cx="135" cy="15" r="3.5" fill="#38bdf8" />
              </svg>

              {/* X-Axis labels matching screenshot: 0, 22, 21, 10, 10, 11, 18, 10 */}
              <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-1">
                <span>0</span>
                <span>22</span>
                <span>21</span>
                <span>10</span>
                <span>10</span>
                <span>11</span>
                <span>18</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Card 3: Review Management (Donut Ring Chart with 84% & Legend) */}
          <div className="rounded-2xl bg-[#111724] border border-[#1e2638] p-4 flex flex-col justify-between space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white tracking-wide">Review Management</h3>
              <span className="text-[10px] text-emerald-400 font-semibold">Positive Trend</span>
            </div>

            {/* Donut Chart matching screenshot */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center my-1">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" stroke="#1c2436" strokeWidth="12" fill="none" />
                
                {/* Positive Sentiment Arc (Teal/Cyan) 75% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="238"
                  strokeDashoffset="60"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Respond Rating Arc (Orange) 15% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#f97316"
                  strokeWidth="12"
                  strokeDasharray="238"
                  strokeDashoffset="200"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Escalated / Neutral (Yellow) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#eab308"
                  strokeWidth="12"
                  strokeDasharray="238"
                  strokeDashoffset="220"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>

              {/* Centered Percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-white leading-none">84%</span>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Pos</span>
              </div>
            </div>

            {/* Legend at bottom matching screenshot */}
            <div className="flex items-center justify-around pt-2 border-t border-white/5 text-[10px]">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Positive Sentiment</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Respond Rating</span>
              </div>
            </div>

            <button
              onClick={onOpenReviews}
              className="w-full py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
            >
              <span>Manage & Respond</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
