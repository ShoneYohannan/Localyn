"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Sidebar, TabType } from "@/components/Sidebar";
import { GeoGridDashboardView } from "@/components/GeoGridDashboardView";
import { DashboardView } from "@/components/DashboardView";
import { AuditView } from "@/components/AuditView";
import { CompetitorsView } from "@/components/CompetitorsView";
import { ReviewsView } from "@/components/ReviewsView";
import { AutomationsView } from "@/components/AutomationsView";
import { IntegrationsView } from "@/components/IntegrationsView";
import { OnboardingModal } from "@/components/OnboardingModal";
import { GoogleRankKitModal } from "@/components/GoogleRankKitModal";
import { api } from "@/lib/api";
import { 
  Business, 
  DashboardSummary, 
  WebsiteAudit, 
  Competitor, 
  Review, 
  AutomationJob, 
  ApprovalRequest,
  NotificationItem 
} from "@/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [audit, setAudit] = useState<WebsiteAudit | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(true);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isRankKitOpen, setIsRankKitOpen] = useState(false);

  // Load business-specific data
  const loadBusinessData = useCallback(async (businessId: string) => {
    setIsSyncing(true);
    try {
      const [sumData, auditData, compData, revData, autoData, appData] = await Promise.allSettled([
        api.getDashboardSummary(businessId),
        api.getAudits(businessId),
        api.getCompetitors(businessId),
        api.getReviews(businessId),
        api.getAutomations(businessId),
        api.getApprovals(businessId),
      ]);

      if (sumData.status === "fulfilled") setSummary(sumData.value);
      if (auditData.status === "fulfilled" && auditData.value.length > 0) setAudit(auditData.value[0]);
      if (compData.status === "fulfilled") {
        setCompetitors(compData.value.competitors || compData.value.top_competitors || []);
      }
      if (revData.status === "fulfilled") {
        setReviews(revData.value.recent_reviews || []);
      }
      if (autoData.status === "fulfilled") setJobs(autoData.value);
      if (appData.status === "fulfilled") setApprovals(appData.value);

      // Check Google status
      try {
        const gStatus = await api.getGoogleStatus(businessId);
        setIsGoogleConnected(gStatus.status === "connected");
      } catch (e) {
        setIsGoogleConnected(true);
      }
    } catch (err) {
      console.error("Error loading business context:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const bizList = await api.getBusinesses();
        setBusinesses(bizList);
        if (bizList.length > 0) {
          setSelectedBusiness(bizList[0]);
          await loadBusinessData(bizList[0].id);
        }

        // Load notifications
        try {
          const notifs = await api.getNotifications();
          setNotifications(notifs);
        } catch (e) {
          console.warn("Could not load notifications:", e);
        }
      } catch (err) {
        console.error("Initial load error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [loadBusinessData]);

  // Handle actions
  const handleSelectBusiness = (b: Business) => {
    setSelectedBusiness(b);
    loadBusinessData(b.id);
  };

  const handleTriggerAudit = async (url?: string) => {
    if (!selectedBusiness) return;
    setIsAuditing(true);
    try {
      const newAudit = await api.runAudit(selectedBusiness.id, url);
      setAudit(newAudit);
      await loadBusinessData(selectedBusiness.id);
    } catch (err) {
      alert("Audit request failed: " + err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDiscoverCompetitors = async (cat: string, loc: string, rad: number) => {
    if (!selectedBusiness) return;
    setIsDiscovering(true);
    try {
      const discovered = await api.discoverCompetitors(selectedBusiness.id, cat, loc, rad);
      setCompetitors(discovered);
      await loadBusinessData(selectedBusiness.id);
    } catch (err) {
      alert("Competitor discovery failed: " + err);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleGenerateReviewResponse = async (reviewId: string, tone: string) => {
    if (!selectedBusiness) return "";
    const res = await api.generateReviewResponse(selectedBusiness.id, reviewId, tone);
    return res.suggested_reply || "";
  };

  const handlePublishReviewResponse = async (reviewId: string, text: string) => {
    if (!selectedBusiness) return;
    await api.publishReviewResponse(selectedBusiness.id, reviewId, text);
    await loadBusinessData(selectedBusiness.id);
  };

  const handleTriggerJob = async (jobId: string) => {
    if (!selectedBusiness) return;
    await api.triggerAutomationJob(selectedBusiness.id, jobId);
    await loadBusinessData(selectedBusiness.id);
  };

  const handleResolveApproval = async (approvalId: string, action: "approve" | "reject", reason?: string) => {
    if (!selectedBusiness) return;
    await api.resolveApproval(selectedBusiness.id, approvalId, action, reason);
    await loadBusinessData(selectedBusiness.id);
  };

  const handleConnectDemoGoogle = async () => {
    if (!selectedBusiness) return;
    await api.connectDemoGoogle(selectedBusiness.id);
    setIsGoogleConnected(true);
    await loadBusinessData(selectedBusiness.id);
  };

  const handleDisconnectGoogle = async () => {
    if (!selectedBusiness) return;
    await api.disconnectGoogle(selectedBusiness.id);
    setIsGoogleConnected(false);
    await loadBusinessData(selectedBusiness.id);
  };

  const handleCreateBusiness = async (payload: any) => {
    const created = await api.createBusiness(payload);
    setBusinesses(prev => [...prev, created]);
    setSelectedBusiness(created);
    await loadBusinessData(created.id);
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const pendingApprovalsCount = approvals.filter(a => a.status === "pending").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a11] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 animate-spin flex items-center justify-center" />
        <h2 className="text-lg font-bold text-white tracking-tight">Initializing Localyn Platform...</h2>
        <p className="text-xs text-slate-400">Loading AI intelligence models and tenant telemetry</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a11] flex flex-col text-slate-100">
      {/* Top Navbar */}
      <Header
        business={selectedBusiness}
        businesses={businesses}
        onSelectBusiness={handleSelectBusiness}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        isSyncing={isSyncing}
        onRefreshData={() => selectedBusiness && loadBusinessData(selectedBusiness.id)}
        onOpenRankKit={() => setIsRankKitOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Mini-Rail */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingApprovalsCount={pendingApprovalsCount}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        {/* Dynamic Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-5 max-w-[1720px] mx-auto w-full">
          {selectedBusiness ? (
            <>
              {activeTab === "dashboard" && (
                <GeoGridDashboardView
                  business={selectedBusiness}
                  summary={summary}
                  reviews={reviews}
                  audit={audit}
                  competitors={competitors}
                  approvals={approvals}
                  onOpenAudit={() => setActiveTab("audit")}
                  onOpenCompetitors={() => setActiveTab("competitors")}
                  onOpenReviews={() => setActiveTab("reviews")}
                  onOpenAutomations={() => setActiveTab("automations")}
                  onOpenIntegrations={() => setActiveTab("integrations")}
                  onTriggerAudit={() => handleTriggerAudit()}
                  onOpenOnboarding={() => setIsOnboardingOpen(true)}
                />
              )}

              {activeTab === "audit" && (
                <AuditView
                  business={selectedBusiness}
                  audit={audit}
                  onRunAudit={handleTriggerAudit}
                  isAuditing={isAuditing}
                />
              )}

              {activeTab === "competitors" && (
                <CompetitorsView
                  business={selectedBusiness}
                  competitors={competitors}
                  onDiscoverCompetitors={handleDiscoverCompetitors}
                  isDiscovering={isDiscovering}
                />
              )}

              {activeTab === "reviews" && (
                <ReviewsView
                  business={selectedBusiness}
                  reviews={reviews}
                  onGenerateResponse={handleGenerateReviewResponse}
                  onPublishResponse={handlePublishReviewResponse}
                />
              )}

              {activeTab === "automations" && (
                <AutomationsView
                  business={selectedBusiness}
                  jobs={jobs}
                  approvals={approvals}
                  onTriggerJob={handleTriggerJob}
                  onResolveApproval={handleResolveApproval}
                />
              )}

              {activeTab === "integrations" && (
                <IntegrationsView
                  business={selectedBusiness}
                  isConnected={isGoogleConnected}
                  onConnectDemo={handleConnectDemoGoogle}
                  onDisconnect={handleDisconnectGoogle}
                />
              )}
            </>
          ) : (
            <div className="text-center py-20 space-y-4">
              <h2 className="text-xl font-bold text-white">No Business Profile Configured</h2>
              <p className="text-xs text-slate-400">Add your first business location to unlock AI local intelligence.</p>
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Onboard New Business
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSubmit={handleCreateBusiness}
      />

      {/* Google Ranking Booster Modal */}
      {selectedBusiness && (
        <GoogleRankKitModal
          isOpen={isRankKitOpen}
          onClose={() => setIsRankKitOpen(false)}
          business={selectedBusiness}
        />
      )}
    </div>
  );
}
