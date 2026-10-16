const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("localyn_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("localyn_token", token);
    }
  }

  async ensureAuthenticated(): Promise<string> {
    if (this.token) return this.token;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "demo@localyn.ai",
          password: "LocalynPass123!"
        })
      });

      if (res.ok) {
        const data = await res.json();
        const access = data.token.access_token;
        this.setToken(access);
        return access;
      }
    } catch (e) {
      console.warn("Could not auto-login with backend, running in resilient mode", e);
    }
    return "";
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = await this.ensureAuthenticated();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error [${res.status}]: ${errorText}`);
    }

    return res.json();
  }

  // Businesses
  async getBusinesses() {
    return this.fetchWithAuth("/businesses");
  }

  async createBusiness(data: any) {
    return this.fetchWithAuth("/businesses", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  async getDashboardSummary(businessId: string) {
    return this.fetchWithAuth(`/businesses/${businessId}/dashboard-summary`);
  }

  // Audits
  async getAudits(businessId: string) {
    return this.fetchWithAuth(`/businesses/${businessId}/audits`);
  }

  async runAudit(businessId: string, url?: string) {
    return this.fetchWithAuth(`/businesses/${businessId}/audits/run`, {
      method: "POST",
      body: JSON.stringify({ url: url || undefined })
    });
  }

  // Competitors
  async getCompetitors(businessId: string) {
    return this.fetchWithAuth(`/businesses/${businessId}/competitors`);
  }

  async discoverCompetitors(businessId: string, category: string, locationQuery: string, radiusMeters: number = 5000) {
    return this.fetchWithAuth(`/businesses/${businessId}/competitors/discover`, {
      method: "POST",
      body: JSON.stringify({
        category,
        location_query: locationQuery,
        radius_meters: radiusMeters
      })
    });
  }

  // Reviews
  async getReviews(businessId: string) {
    return this.fetchWithAuth(`/businesses/${businessId}/reviews`);
  }

  async generateReviewResponse(businessId: string, reviewId: string, tone: string = "professional") {
    return this.fetchWithAuth(`/businesses/${businessId}/reviews/${reviewId}/generate-response`, {
      method: "POST",
      body: JSON.stringify({ tone })
    });
  }

  async publishReviewResponse(businessId: string, reviewId: string, responseText: string) {
    return this.fetchWithAuth(`/businesses/${businessId}/reviews/${reviewId}/publish-response`, {
      method: "POST",
      body: JSON.stringify({ response_text: responseText })
    });
  }

  // Recommendations
  async getRecommendations(businessId: string) {
    return this.fetchWithAuth(`/businesses/${businessId}/recommendations`);
  }

  async generateRecommendations(businessId: string, focusArea: string = "all") {
    return this.fetchWithAuth(`/businesses/${businessId}/recommendations/generate`, {
      method: "POST",
      body: JSON.stringify({ focus_area: focusArea })
    });
  }

  async updateRecommendationStatus(businessId: string, recId: string, status: string) {
    return this.fetchWithAuth(`/businesses/${businessId}/recommendations/${recId}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  }

  // Automations & Approvals
  async getAutomations(businessId: string) {
    return this.fetchWithAuth(`/businesses/${businessId}/automations`);
  }

  async triggerAutomationJob(businessId: string, jobId: string) {
    return this.fetchWithAuth(`/businesses/${businessId}/automations/${jobId}/trigger`, {
      method: "POST"
    });
  }

  async getApprovals(businessId: string) {
    return this.fetchWithAuth(`/businesses/${businessId}/automations/approvals`);
  }

  async resolveApproval(businessId: string, approvalId: string, action: "approve" | "reject", rejectionReason?: string) {
    return this.fetchWithAuth(`/businesses/${businessId}/automations/approvals/${approvalId}/action`, {
      method: "POST",
      body: JSON.stringify({ action, rejection_reason: rejectionReason })
    });
  }

  // Integrations
  async getGoogleStatus(businessId: string) {
    return this.fetchWithAuth(`/integrations/${businessId}/google/status`);
  }

  async connectDemoGoogle(businessId: string) {
    return this.fetchWithAuth(`/integrations/${businessId}/google/connect-demo`, {
      method: "POST"
    });
  }

  async disconnectGoogle(businessId: string) {
    return this.fetchWithAuth(`/integrations/${businessId}/google/disconnect`, {
      method: "POST"
    });
  }

  // Notifications
  async getNotifications() {
    return this.fetchWithAuth("/notifications");
  }

  async markNotificationRead(id: string) {
    return this.fetchWithAuth(`/notifications/${id}/read`, {
      method: "POST"
    });
  }
}

export const api = new ApiClient();
