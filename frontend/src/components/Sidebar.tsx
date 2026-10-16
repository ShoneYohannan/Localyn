"use client";

import React from "react";
import { 
  Folder, 
  Target, 
  MessageSquare, 
  SlidersHorizontal, 
  Share2, 
  Plus, 
  ShieldCheck,
  Globe2
} from "lucide-react";

export type TabType = 
  | "dashboard"
  | "audit"
  | "competitors"
  | "reviews"
  | "automations"
  | "integrations";

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingApprovalsCount: number;
  onOpenOnboarding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingApprovalsCount,
  onOpenOnboarding
}) => {
  return (
    <aside className="w-16 shrink-0 bg-[#0a0d14] border-r border-[#1c2436] min-h-[calc(100vh-57px)] py-4 flex flex-col items-center justify-between z-30">
      {/* Top Dock Stack */}
      <div className="flex flex-col items-center space-y-3 w-full px-2">
        
        {/* Active Blue 4-Dots Launcher Icon matching screenshot */}
        <button
          onClick={() => onSelectTab("dashboard")}
          title="Local Business SEO Dashboard"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "dashboard"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-2 ring-blue-400/30"
              : "bg-[#121722] text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          {/* 4 dots svg */}
          <div className="grid grid-cols-2 gap-1 w-4 h-4">
            <span className="w-1.5 h-1.5 rounded-sm bg-current" />
            <span className="w-1.5 h-1.5 rounded-sm bg-current" />
            <span className="w-1.5 h-1.5 rounded-sm bg-current" />
            <span className="w-1.5 h-1.5 rounded-sm bg-current" />
          </div>
        </button>

        {/* Divider */}
        <div className="w-6 h-px bg-white/10 my-1" />

        {/* 1. Folder / Audits */}
        <button
          onClick={() => onSelectTab("audit")}
          title="Website Technical SEO Audits"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "audit"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-[#121722]"
          }`}
        >
          <Folder className="w-4 h-4" />
        </button>

        {/* 2. Target / Competitor Benchmarks */}
        <button
          onClick={() => onSelectTab("competitors")}
          title="Competitor Benchmarking"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "competitors"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-[#121722]"
          }`}
        >
          <Target className="w-4 h-4" />
        </button>

        {/* 3. Messages / Reviews */}
        <button
          onClick={() => onSelectTab("reviews")}
          title="Customer Reviews & AI Responder"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "reviews"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-[#121722]"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* 4. Sliders / Automations & Approvals */}
        <div className="relative">
          <button
            onClick={() => onSelectTab("automations")}
            title="Scheduled Automations & Approval Safety Queue"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              activeTab === "automations"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-[#121722]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          {pendingApprovalsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center shadow-md animate-pulse">
              {pendingApprovalsCount}
            </span>
          )}
        </div>

        {/* 5. Share2 / Integrations */}
        <button
          onClick={() => onSelectTab("integrations")}
          title="Google Business Profile Integrations"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "integrations"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-[#121722]"
          }`}
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Action: Add Location */}
      <div className="flex flex-col items-center space-y-2">
        {onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            title="Onboard New Business / Location"
            className="w-10 h-10 rounded-xl bg-[#121722] hover:bg-orange-600/20 hover:text-orange-400 text-slate-400 border border-[#1e2638] flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
