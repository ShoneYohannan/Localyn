import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "healthy"

def test_login_demo_user():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@localyn.ai", "password": "LocalynPass123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == "demo@localyn.ai"
    assert data["user"]["organization"]["name"] == "Apex Marketing & Growth"

def test_list_businesses_and_dashboard_summary():
    # Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@localyn.ai", "password": "LocalynPass123!"}
    )
    token = login_res.json()["token"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch businesses
    res = client.get("/api/v1/businesses", headers=headers)
    assert res.status_code == 200
    businesses = res.json()
    assert len(businesses) >= 1
    business_id = businesses[0]["id"]

    # Dashboard Summary
    dash_res = client.get(f"/api/v1/businesses/{business_id}/dashboard-summary", headers=headers)
    assert dash_res.status_code == 200
    summary = dash_res.json()
    assert "opportunity_score" in summary
    assert "opportunity_factors" in summary
    assert summary["total_competitors"] >= 1
    assert summary["total_reviews"] >= 1

def test_competitors_and_discovery():
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@localyn.ai", "password": "LocalynPass123!"}
    )
    token = login_res.json()["token"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    biz_id = client.get("/api/v1/businesses", headers=headers).json()[0]["id"]

    # Benchmark endpoint
    bench_res = client.get(f"/api/v1/businesses/{biz_id}/competitors", headers=headers)
    assert bench_res.status_code == 200
    bench = bench_res.json()
    assert bench["total_competitors"] >= 1

    # Discover new competitors (runs mock/real Places adapter)
    disc_res = client.post(
        f"/api/v1/businesses/{biz_id}/competitors/discover",
        json={"category": "Dentist", "location_query": "Chicago, IL", "radius_meters": 5000},
        headers=headers
    )
    assert disc_res.status_code == 200
    discovered = disc_res.json()
    assert len(discovered) >= 1

def test_reviews_and_ai_draft_response():
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@localyn.ai", "password": "LocalynPass123!"}
    )
    token = login_res.json()["token"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    biz_id = client.get("/api/v1/businesses", headers=headers).json()[0]["id"]

    # Fetch reviews
    rev_res = client.get(f"/api/v1/businesses/{biz_id}/reviews", headers=headers)
    assert rev_res.status_code == 200
    data = rev_res.json()
    assert data["total_reviews"] >= 1
    first_review = data["recent_reviews"][0]

    # Generate response
    gen_res = client.post(
        f"/api/v1/businesses/{biz_id}/reviews/{first_review['id']}/generate-response",
        json={"tone": "professional"},
        headers=headers
    )
    assert gen_res.status_code == 200
    draft = gen_res.json()
    assert "suggested_reply" in draft
    assert len(draft["suggested_reply"]) > 10

def test_automations_and_approval_workflow():
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@localyn.ai", "password": "LocalynPass123!"}
    )
    token = login_res.json()["token"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    biz_id = client.get("/api/v1/businesses", headers=headers).json()[0]["id"]

    # List jobs
    jobs_res = client.get(f"/api/v1/businesses/{biz_id}/automations", headers=headers)
    assert jobs_res.status_code == 200
    jobs = jobs_res.json()
    assert len(jobs) >= 1

    # List approvals
    approvals_res = client.get(f"/api/v1/businesses/{biz_id}/automations/approvals", headers=headers)
    assert approvals_res.status_code == 200
    approvals = approvals_res.json()
    assert len(approvals) >= 1
    pending_approval = approvals[0]

    # Resolve approval if pending
    if pending_approval["status"] == "pending":
        act_res = client.post(
            f"/api/v1/businesses/{biz_id}/automations/approvals/{pending_approval['id']}/action",
            json={"action": "approve"},
            headers=headers
        )
        assert act_res.status_code == 200
        assert act_res.json()["status"] == "approved"
