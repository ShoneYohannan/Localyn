"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Check, 
  Copy, 
  Globe, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Code
} from "lucide-react";
import { Business } from "@/types";

interface GoogleRankKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
}

export const GoogleRankKitModal: React.FC<GoogleRankKitModalProps> = ({
  isOpen,
  onClose,
  business
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const websiteUrl = business.website_url || "https://hamper-beta.vercel.app";
  const title = "Luxury Gift Hampers & Haute Gifting Atelier | Dazzling Hampers";
  const description = "Discover bespoke luxury gift hampers, artisanal gourmet boxes & custom corporate gifting by Dazzling Hampers. Handcrafted premium presentation with express delivery.";
  const keywords = business.target_keywords?.join(", ") || "luxury gift hampers, haute gifting atelier, bespoke gift baskets, corporate gifting boxes";

  // Google Schema.org JSON-LD snippet
  const schemaSnippet = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Dazzling Hampers",
  "image": "${websiteUrl}/favicon.svg",
  "@id": "${websiteUrl}",
  "url": "${websiteUrl}",
  "telephone": "+1-800-555-4267",
  "priceRange": "$$$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "742 Haute Atelier Row",
    "addressLocality": "New York",
    "addressRegion": "NY",
    "postalCode": "10001",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 40.7484,
    "longitude": -73.9857
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "09:00",
    "closes": "19:00"
  },
  "sameAs": [
    "https://instagram.com/dazzlinghampers",
    "https://facebook.com/dazzlinghampers"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Luxury Gifting Catalog",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Bespoke Haute Gift Hampers"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Corporate Luxury Gift Boxes"
        }
      }
    ]
  }
}
</script>`;

  const fullHeaderSnippet = `<!-- ============================================== -->
<!-- Localyn AI Google Rank Optimization Code        -->
<!-- Paste this into your website <head> section    -->
<!-- ============================================== -->
<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="keywords" content="${keywords}" />
<link rel="canonical" href="${websiteUrl}" />

<!-- OpenGraph / Social Rich Previews -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${websiteUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${websiteUrl}/og-image.jpg" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />

<!-- Google Schema.org Structured Data -->
${schemaSnippet}`;

  const copyCode = () => {
    navigator.clipboard.writeText(fullHeaderSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel bg-[#0f172a] border border-white/10 p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Google Ranking Booster for {business.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                Target URL: <code className="text-cyan-400">{websiteUrl}</code>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs p-1">✕</button>
        </div>

        {/* Audit Status Alert */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Why your website is not yet ranking on Google:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-300">
            <li><strong>Missing Meta Description</strong>: Google has no search summary snippet for your site.</li>
            <li><strong>Missing Schema.org Markup</strong>: Google’s algorithm does not know your luxury hampers, price tier, or catalog.</li>
            <li><strong>Missing H1 Tag in HTML</strong>: Your main value proposition is hidden inside client-side JS bundles.</li>
          </ul>
        </div>

        {/* Generated Google Search Preview Card */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Google Search Preview (What users will see on Google):
          </span>
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-1">
            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
              <span>{websiteUrl}</span>
            </div>
            <h4 className="text-sm font-semibold text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
              {title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Copyable HTML Code Block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ready-to-Paste Code for your Website &lt;head&gt;:</span>
            </span>
            <button
              onClick={copyCode}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3.5 rounded-xl bg-slate-950 border border-white/10 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-48 leading-relaxed">
            {fullHeaderSnippet}
          </pre>
        </div>

        {/* How to apply */}
        <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2 text-xs">
          <h5 className="font-bold text-white flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>3 Steps to Get Ranked on Google:</span>
          </h5>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
            <li>Open your website repo (Vercel project) and paste the code above into the <code>&lt;head&gt;</code> of <code>index.html</code>.</li>
            <li>Deploy your Vercel site so Google can crawl the new tags.</li>
            <li>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">Google Search Console</a>, paste <code>{websiteUrl}</code>, and click <strong>"Request Indexing"</strong>!</li>
          </ol>
        </div>

        {/* Footer actions */}
        <div className="flex space-x-2 pt-2 border-t border-white/5">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
          >
            Close
          </button>
          <button
            onClick={copyCode}
            className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? "Copied!" : "Copy Google Code"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
