"use client";

import React, { useState } from "react";
import { 
  MessageSquareQuote, 
  Star, 
  Smile, 
  Meh, 
  Frown, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Filter
} from "lucide-react";
import { Review, Business } from "@/types";

interface ReviewsViewProps {
  business: Business;
  reviews: Review[];
  onGenerateResponse: (reviewId: string, tone: string) => Promise<string>;
  onPublishResponse: (reviewId: string, text: string) => Promise<void>;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  business,
  reviews,
  onGenerateResponse,
  onPublishResponse
}) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>("professional");
  const [generatedDraft, setGeneratedDraft] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Sentiment stats
  const totalReviews = reviews.length;
  const positiveCount = reviews.filter(r => r.sentiment === "positive").length;
  const neutralCount = reviews.filter(r => r.sentiment === "neutral").length;
  const negativeCount = reviews.filter(r => r.sentiment === "negative").length;
  const escalatedCount = reviews.filter(r => r.is_escalated).length;

  const positivePercent = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
  const neutralPercent = totalReviews > 0 ? Math.round((neutralCount / totalReviews) * 100) : 0;
  const negativePercent = totalReviews > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0;

  const filteredReviews = reviews.filter(r => {
    if (activeFilter === "positive") return r.sentiment === "positive";
    if (activeFilter === "neutral") return r.sentiment === "neutral";
    if (activeFilter === "negative") return r.sentiment === "negative";
    if (activeFilter === "needs_response") return r.response_status === "needs_response";
    return true;
  });

  const handleOpenAiModal = async (review: Review) => {
    setSelectedReview(review);
    setGeneratedDraft("");
    setIsGenerating(true);
    try {
      const draft = await onGenerateResponse(review.id, selectedTone);
      setGeneratedDraft(draft);
    } catch (e) {
      setGeneratedDraft("Thank you for your valuable feedback. We are committed to providing top-quality dental care and would love to resolve any concerns with you directly.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (tone: string) => {
    if (!selectedReview) return;
    setSelectedTone(tone);
    setIsGenerating(true);
    try {
      const draft = await onGenerateResponse(selectedReview.id, tone);
      setGeneratedDraft(draft);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedReview || !generatedDraft) return;
    setIsPublishing(true);
    try {
      await onPublishResponse(selectedReview.id, generatedDraft);
      setSelectedReview(null);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Sentiment Analytics */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <MessageSquareQuote className="w-4 h-4" />
            <span>AI Review Responder & Sentiment Radar</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Customer Reviews & Reputation Health
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time sentiment categorization, negative review escalation, and 1-click contextual AI response generation.
          </p>
        </div>

        {escalatedCount > 0 && (
          <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span><strong>{escalatedCount} critical review(s)</strong> require timely attention</span>
          </div>
        )}
      </div>

      {/* Sentiment Breakdown Ratio Card */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 bg-slate-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sentiment Distribution ({totalReviews} total reviews)
          </span>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <Smile className="w-3.5 h-3.5" />
              <span>{positivePercent}% Positive</span>
            </span>
            <span className="flex items-center space-x-1 text-amber-400 font-semibold">
              <Meh className="w-3.5 h-3.5" />
              <span>{neutralPercent}% Neutral</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-400 font-semibold">
              <Frown className="w-3.5 h-3.5" />
              <span>{negativePercent}% Negative</span>
            </span>
          </div>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden">
          <div style={{ width: `${positivePercent}%` }} className="bg-emerald-500 transition-all duration-500" />
          <div style={{ width: `${neutralPercent}%` }} className="bg-amber-400 transition-all duration-500" />
          <div style={{ width: `${negativePercent}%` }} className="bg-rose-500 transition-all duration-500" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All Reviews" },
          { id: "needs_response", label: "Needs Response" },
          { id: "positive", label: "Positive (5★ & 4★)" },
          { id: "neutral", label: "Neutral" },
          { id: "negative", label: "Negative / Critical" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeFilter === tab.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const isNegative = review.sentiment === "negative" || review.rating <= 2;
          return (
            <div
              key={review.id}
              className={`p-5 rounded-2xl glass-panel border transition-all space-y-3 ${
                isNegative ? "border-rose-500/30 bg-rose-950/10" : "border-white/10 bg-slate-900/50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white border border-white/10">
                    {review.author_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{review.author_name}</h4>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < review.rating ? "opacity-100" : "opacity-30"}>★</span>
                        ))}
                      </div>
                      <span>•</span>
                      <span>Google Business Profile</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    review.sentiment === "positive"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      : review.sentiment === "neutral"
                      ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-extrabold"
                  }`}>
                    {review.sentiment} ({review.sentiment_score > 0 ? `+${review.sentiment_score}` : review.sentiment_score})
                  </span>

                  {review.response_status === "responded" ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Responded</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Awaiting Reply</span>
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                "{review.text}"
              </p>

              {/* Topics */}
              {review.topics?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Topics:</span>
                  {review.topics.map((t, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/5">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Existing Response or AI Draft Button */}
              {review.response_status === "responded" && review.response_text ? (
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Published Business Owner Response:</span>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{review.response_text}</p>
                </div>
              ) : (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleOpenAiModal(review)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Response</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Response Generator Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl glass-panel bg-[#0f172a] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Review Response Generator</span>
              </h3>
              <button 
                onClick={() => setSelectedReview(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Quote review */}
            <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1 text-xs">
              <div className="text-slate-400 font-semibold">{selectedReview.author_name} ({selectedReview.rating}★) wrote:</div>
              <p className="text-slate-300 italic">"{selectedReview.text}"</p>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Desired Tone of Voice</label>
              <div className="grid grid-cols-4 gap-2">
                {["professional", "empathetic", "enthusiastic", "concise"].map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => handleRegenerate(tone)}
                    disabled={isGenerating}
                    className={`py-1.5 rounded-lg text-xs capitalize font-medium transition-all ${
                      selectedTone === tone
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Draft Output Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Generated Response Draft (Editable)</label>
              <textarea
                rows={4}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                placeholder="Generating response..."
                disabled={isGenerating}
                className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || !generatedDraft || isGenerating}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPublishing ? "Publishing..." : "Approve & Publish"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
