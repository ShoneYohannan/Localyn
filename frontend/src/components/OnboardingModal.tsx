"use client";

import React, { useState } from "react";
import { Building2, Sparkles, MapPin, Globe, Phone, Tag, ArrowRight } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "Dentist & Cosmetic Dental",
    website_url: "",
    phone: "",
    address: "",
    city: "Chicago",
    state: "IL",
    postal_code: "",
    target_keywords: "cosmetic dentist, emergency dental, teeth whitening",
    services: "Cosmetic Dentistry, Preventive Hygiene, Teeth Whitening, Invisalign"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        website_url: formData.website_url || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postal_code: formData.postal_code || undefined,
        target_keywords: formData.target_keywords.split(",").map(s => s.trim()).filter(Boolean),
        services: formData.services.split(",").map(s => s.trim()).filter(Boolean)
      };
      await onSubmit(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl glass-panel bg-[#0f172a] border border-white/10 p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Onboard New Business / Location</h3>
              <p className="text-[11px] text-slate-400">Instantly generate baseline opportunity score & scheduled jobs</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-300">Business / Location Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Smiles Studio"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Website URL</label>
              <input
                type="url"
                placeholder="https://yourwebsite.com"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-300">Street Address</label>
              <input
                type="text"
                placeholder="123 Main St"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Target Keywords (comma-separated)</label>
            <input
              type="text"
              value={formData.target_keywords}
              onChange={(e) => setFormData({ ...formData, target_keywords: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Core Services (comma-separated)</label>
            <input
              type="text"
              value={formData.services}
              onChange={(e) => setFormData({ ...formData, services: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name}
              className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <span>{isSubmitting ? "Onboarding..." : "Calculate Score & Add"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
