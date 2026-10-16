"use client";

import React, { useState } from "react";
import { 
  Building2, 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  Plus, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check
} from "lucide-react";
import { Business, NotificationItem } from "@/types";

interface HeaderProps {
  business: Business | null;
  businesses: Business[];
  onSelectBusiness: (biz: Business) => void;
  onOpenOnboarding: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  isSyncing?: boolean;
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  business,
  businesses,
  onSelectBusiness,
  onOpenOnboarding,
  notifications,
  onMarkNotificationRead,
  isSyncing = false,
  onRefreshData
}) => {
  const [showBizDropdown, setShowBizDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0d14] border-b border-[#1c2436] px-5 py-3 flex items-center justify-between">
      {/* Brand matching screenshot: Orange swirl/target icon + "Local Business SEO" */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2.5 cursor-pointer">
          {/* Orange swirl logo */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
              Local Business SEO
            </h1>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">
              {business?.name || "Apex Dental Studio"} • Chicago, IL
            </p>
          </div>
        </div>

        {/* Business Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowBizDropdown(!showBizDropdown)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#121722] hover:bg-[#1a2130] border border-[#1e2638] text-xs font-semibold text-slate-200 transition-all"
          >
            <Building2 className="w-3.5 h-3.5 text-orange-400" />
            <span>{business?.name || "Select Business"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showBizDropdown && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#121722] border border-[#1e2638] shadow-2xl p-2 z-50 animate-in fade-in duration-100">
              <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                Locations ({businesses.length})
              </div>
              <div className="space-y-1 my-1">
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectBusiness(b);
                      setShowBizDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      business?.id === b.id
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.category} • {b.city || "Primary"}</div>
                    </div>
                    {business?.id === b.id && <Check className="w-4 h-4 text-orange-400" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    setShowBizDropdown(false);
                    onOpenOnboarding();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-orange-300 hover:bg-orange-500/10 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Onboard New Location</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side items matching screenshot */}
      <div className="flex items-center space-x-3.5">
        {/* Refresh button */}
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            title="Refresh Real-time Rank & Telemetry"
            disabled={isSyncing}
            className="p-1.5 rounded-xl bg-[#121722] hover:bg-[#1a2130] border border-[#1e2638] text-slate-400 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-orange-400" : ""}`} />
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-xl bg-[#121722] hover:bg-[#1a2130] border border-[#1e2638] text-slate-400 hover:text-white transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#121722] border border-[#1e2638] shadow-2xl p-3 z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-semibold text-white">System Alerts</span>
                <span className="text-[10px] text-slate-400">{unreadCount} unread</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-white/5 my-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`py-2 px-1 cursor-pointer hover:bg-white/5 rounded-lg transition-colors ${
                        !n.is_read ? "bg-orange-500/10" : "opacity-75"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-orange-400 mt-1" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* "4 Below" Pill Badge from screenshot */}
        <div className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-[#121722] border border-[#1e2638] text-xs font-semibold text-cyan-400">
          <span>+ 4 Below</span>
        </div>

        {/* Profile Avatar with glowing border matching screenshot */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 p-[2px] shadow-md shadow-pink-500/20">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs text-white">
              AR
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0d14]" />
        </div>
      </div>
    </header>
  );
};
