export interface Business {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  website_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  target_keywords: string[];
  target_audience: string[];
  services: string[];
  opportunity_score: number;
  opportunity_factors: {
    total_score: number;
    profile_completeness?: { score: number; max: number; status: string };
    website_health?: { score: number; max: number; status: string };
    review_sentiment?: { score: number; max: number; status: string };
    competitor_gap?: { score: number; max: number; status: string };
    keyword_readiness?: { score: number; max: number; status: string };
  };
  created_at: string;
}

export interface WebsiteAudit {
  id: string;
  business_id: string;
  audited_url: string;
  overall_score: number;
  seo_score: number;
  performance_score: number;
  security_score: number;
  mobile_score: number;
  response_time_ms: number;
  status: string;
  summary: string;
  issues: {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    remediation: string;
  }[];
  meta_tags: Record<string, string>;
  headings: { h1?: string[]; h2_count?: number; h3_count?: number };
  created_at: string;
}

export interface Competitor {
  id: string;
  business_id: string;
  name: string;
  category?: string;
  address?: string;
  rating: number;
  review_count: number;
  distance_km?: number;
  strengths: string[];
  weaknesses: string[];
  created_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  author_name: string;
  author_avatar_url?: string;
  rating: number;
  text?: string;
  source: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number;
  topics: string[];
  is_escalated: boolean;
  response_status: 'needs_response' | 'drafted' | 'responded' | 'ignored';
  response_text?: string;
  review_date: string;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  business_id: string;
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimated_effort: string;
  suggested_action?: string;
  confidence: number;
  status: string;
  created_at: string;
}

export interface AutomationJob {
  id: string;
  business_id: string;
  name: string;
  job_type: string;
  cron_expression: string;
  is_active: boolean;
  requires_approval: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  execution_id?: string;
  business_id: string;
  action_type: string;
  title: string;
  description: string;
  payload: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface DashboardSummary {
  business_id: string;
  business_name: string;
  opportunity_score: number;
  opportunity_factors: Record<string, any>;
  website_health_score: number;
  total_competitors: number;
  average_rating: number;
  total_reviews: number;
  positive_sentiment_percent: number;
  google_gbp_connected: boolean;
  active_automations_count: number;
  pending_approvals_count: number;
  active_recommendations_count: number;
  top_recommendations: Record<string, any>[];
  recent_issues: Record<string, any>[];
  sentiment_breakdown: Record<string, number>;
  competitor_comparison: Record<string, any>;
  last_updated: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}
