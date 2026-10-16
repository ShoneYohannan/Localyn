"use client";

import React, { useState } from "react";
import { 
  Cpu, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Play, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  Sliders,
  Check,
  X
} from "lucide-react";
import { AutomationJob, ApprovalRequest, Business } from "@/types";

interface AutomationsViewProps {
  business: Business;
  jobs: AutomationJob[];
  approvals: ApprovalRequest[];
  onTriggerJob: (jobId: string) => void;
  onResolveApproval: (approvalId: string, action: "approve" | "reject", reason?: string) => void;
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({
  business,
  jobs,
  approvals,
  onTriggerJob,
  onResolveApproval
}) => {
  const [rejectingApprovalId, setRejectingApprovalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [triggeringJobId, setTriggeringJobId] = useState<string | null>(null);

  const pendingApprovals = approvals.filter(a => a.status === "pending");
  const resolvedApprovals = approvals.filter(a => a.status !== "pending");

  const handleTrigger = async (jobId: string) => {
    setTriggeringJobId(jobId);
    try {
      await onTriggerJob(jobId);
    } finally {
      setTriggeringJobId(null);
    }
  };

  const handleRejectSubmit = (approvalId: string) => {
    onResolveApproval(approvalId, "reject", rejectionReason || "Declined by reviewer");
    setRejectingApprovalId(null);
    setRejectionReason("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Workflow Automation & Human-in-the-Loop Safety</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Scheduled Automation Engine & Approval Queue
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Low-risk tasks run autonomously; high-impact public listing modifications pause in the safety queue for your approval.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Celery Scheduler Active (Cron: UTC)</span>
        </div>
      </div>

      {/* Pending Human Approval Queue (High Priority) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Pending Human Approval Queue ({pendingApprovals.length})
            </h3>
          </div>
          <span className="text-xs text-amber-400 font-semibold">Safety Gated</span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-6 rounded-2xl glass-panel border border-white/10 bg-slate-900/30 text-center py-8">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-white">No pending safety approvals</h4>
            <p className="text-xs text-slate-400 mt-1">All high-risk automation jobs are cleared. Next scheduled review checks will queue automatically.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                className="p-5 rounded-2xl glass-panel border border-amber-500/30 bg-amber-950/10 space-y-4 shadow-lg shadow-amber-950/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Approval Required
                    </span>
                    <span className="text-sm font-bold text-white">{approval.title}</span>
                  </div>
                  <span className="text-xs text-slate-400">Action: <code className="text-indigo-300 font-mono">{approval.action_type}</code></span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {approval.description}
                </p>

                {/* Payload details preview */}
                {approval.payload && Object.keys(approval.payload).length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Execution Payload Preview:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {Object.entries(approval.payload).map(([k, v]) => (
                        <div key={k} className="flex space-x-2">
                          <span className="text-slate-400 capitalize">{k.replace('_', ' ')}:</span>
                          <span className="text-white font-medium truncate">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approval Action Buttons */}
                <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setRejectingApprovalId(approval.id)}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => onResolveApproval(approval.id, "approve")}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Publish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Automation Tasks Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Scheduled Automation Jobs</h3>
          </div>
          <span className="text-xs text-slate-400">Autonomous Celery Workers</span>
        </div>

        <div className="rounded-2xl glass-panel border border-white/10 bg-slate-900/40 overflow-hidden">
          <div className="divide-y divide-white/5">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-sm font-bold text-white">{job.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      job.requires_approval
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    }`}>
                      {job.requires_approval ? "Human Gated" : "Autonomous"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                    <span>Cron: <code className="font-mono text-indigo-300">{job.cron_expression}</code></span>
                    <span>•</span>
                    <span>Next scheduled: {job.next_run_at ? new Date(job.next_run_at).toLocaleDateString() : "Next cycle"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleTrigger(job.id)}
                    disabled={triggeringJobId === job.id}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <Play className={`w-3 h-3 text-indigo-400 ${triggeringJobId === job.id ? "animate-spin" : ""}`} />
                    <span>{triggeringJobId === job.id ? "Queuing..." : "Trigger Now"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectingApprovalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl glass-panel bg-[#0f172a] border border-white/10 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Reject Gated Action</h3>
            <p className="text-xs text-slate-400">
              Please specify the rationale for rejecting this automation. The task will be marked cancelled and won't publish to public listings.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Seasonal promotion timing is not aligned with clinic schedule."
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
            />

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setRejectingApprovalId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectSubmit(rejectingApprovalId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
