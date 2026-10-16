import ipaddress
import socket
import time
from urllib.parse import urlparse
from typing import Dict, Any, List
import httpx
from bs4 import BeautifulSoup

class WebsiteAuditService:
    """
    Production-ready website audit engine with built-in SSRF protection,
    metadata extraction, heading hierarchy verification, and security checks.
    """

    # Prohibited IP ranges (SSRF defense: loopback, private, link-local, cloud metadata)
    FORBIDDEN_NETWORKS = [
        ipaddress.ip_network("127.0.0.0/8"),
        ipaddress.ip_network("10.0.0.0/8"),
        ipaddress.ip_network("172.16.0.0/12"),
        ipaddress.ip_network("192.168.0.0/16"),
        ipaddress.ip_network("169.254.0.0/16"),   # AWS / GCP / Azure metadata range
        ipaddress.ip_network("0.0.0.0/8"),
        ipaddress.ip_network("::1/128"),
        ipaddress.ip_network("fc00::/7"),
        ipaddress.ip_network("fe80::/10"),
    ]

    @classmethod
    def validate_url_safe(cls, url: str) -> str:
        """
        Validates URL scheme, resolves hostname, and ensures IP is not internal/private.
        Raises ValueError if URL is dangerous or invalid.
        """
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        parsed = urlparse(url)
        hostname = parsed.hostname
        if not hostname:
            raise ValueError("Invalid URL: missing hostname.")

        # Reject local keywords explicitly
        if hostname.lower() in ("localhost", "127.0.0.1", "::1", "metadata.google.internal"):
            raise ValueError("Access to local/private target is prohibited (SSRF Protection).")

        try:
            addr_info = socket.getaddrinfo(hostname, None)
            for item in addr_info:
                ip_str = item[4][0]
                ip_obj = ipaddress.ip_address(ip_str)
                for net in cls.FORBIDDEN_NETWORKS:
                    if ip_obj in net:
                        raise ValueError(f"Prohibited IP address resolved ({ip_str}) for hostname {hostname}.")
        except socket.gaierror:
            raise ValueError(f"Failed to resolve domain: {hostname}")

        return url

    @classmethod
    async def run_audit(cls, target_url: str) -> Dict[str, Any]:
        """
        Executes audit against target_url safely.
        """
        safe_url = cls.validate_url_safe(target_url)
        start_time = time.time()
        
        headers = {
            "User-Agent": "LocalynSEOAuditor/1.0 (+https://localyn.ai/bot; business audit verification)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }

        try:
            async with httpx.AsyncClient(
                follow_redirects=True,
                timeout=12.0,
                verify=True,
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
            ) as client:
                response = await client.get(safe_url, headers=headers)
                latency_ms = int((time.time() - start_time) * 1000)
                html_text = response.text
                status_code = response.status_code
        except Exception as e:
            # Return graceful failed audit record without crashing
            return {
                "audited_url": safe_url,
                "overall_score": 15,
                "seo_score": 20,
                "performance_score": 10,
                "security_score": 20,
                "mobile_score": 10,
                "response_time_ms": int((time.time() - start_time) * 1000),
                "status": "failed",
                "summary": f"Could not connect to {safe_url}: {str(e)}",
                "issues": [
                    {
                        "severity": "critical",
                        "type": "connectivity",
                        "title": "Website Inaccessible",
                        "message": f"Website failed to respond: {str(e)}",
                        "recommendation": "Verify your domain DNS records, SSL certificate, and web server status."
                    }
                ],
                "meta_tags": {},
                "headings": {},
                "broken_links": [],
                "schema_markup": []
            }

        # Analyze HTML with BeautifulSoup
        soup = BeautifulSoup(html_text, "html.parser")
        issues: List[Dict[str, Any]] = []

        # 1. Meta Tags Analysis
        title_tag = soup.find("title")
        title_text = title_tag.get_text().strip() if title_tag else ""
        meta_desc = soup.find("meta", attrs={"name": "description"})
        desc_text = meta_desc.get("content", "").strip() if meta_desc else ""
        canonical = soup.find("link", attrs={"rel": "canonical"})
        canonical_href = canonical.get("href", "") if canonical else ""
        viewport = soup.find("meta", attrs={"name": "viewport"})
        og_title = soup.find("meta", attrs={"property": "og:title"})

        # Score & Issue evaluation
        seo_points = 100
        security_points = 100
        performance_points = 100
        mobile_points = 100

        # Title checks
        if not title_text:
            seo_points -= 25
            issues.append({
                "severity": "critical",
                "type": "seo",
                "title": "Missing Title Tag",
                "message": "Your page does not have a <title> tag, which is the single most critical on-page SEO factor.",
                "recommendation": "Add a descriptive 50-60 character title containing your core service and city."
            })
        elif len(title_text) < 25:
            seo_points -= 10
            issues.append({
                "severity": "warning",
                "type": "seo",
                "title": "Short Title Tag",
                "message": f"Title '{title_text}' is only {len(title_text)} characters.",
                "recommendation": "Expand your title to 45-60 characters to include targeted local keywords."
            })
        elif len(title_text) > 70:
            seo_points -= 5
            issues.append({
                "severity": "info",
                "type": "seo",
                "title": "Long Title Tag",
                "message": f"Title is {len(title_text)} characters and may be truncated on Google Search results.",
                "recommendation": "Keep title between 50-60 characters for optimal search snippet display."
            })

        # Meta description checks
        if not desc_text:
            seo_points -= 20
            issues.append({
                "severity": "warning",
                "type": "seo",
                "title": "Missing Meta Description",
                "message": "No meta description found. Google may show random body snippets in search results.",
                "recommendation": "Write a compelling 140-160 character meta description with a clear call-to-action."
            })
        elif len(desc_text) < 70:
            seo_points -= 8
            issues.append({
                "severity": "info",
                "type": "seo",
                "title": "Short Meta Description",
                "message": f"Description is only {len(desc_text)} characters.",
                "recommendation": "Expand description to 130-155 characters for higher click-through rates."
            })

        # 2. Heading Hierarchy Analysis
        h1_tags = [h.get_text().strip() for h in soup.find_all("h1")]
        h2_tags = [h.get_text().strip() for h in soup.find_all("h2")]
        
        if len(h1_tags) == 0:
            seo_points -= 20
            issues.append({
                "severity": "critical",
                "type": "seo",
                "title": "Missing H1 Heading",
                "message": "The page has no <h1> heading tag.",
                "recommendation": "Add exactly one prominent <h1> tag that describes your business's primary service and location."
            })
        elif len(h1_tags) > 1:
            seo_points -= 10
            issues.append({
                "severity": "warning",
                "type": "seo",
                "title": "Multiple H1 Headings",
                "message": f"Found {len(h1_tags)} <h1> headings. Multiple H1 tags can dilute topic relevance.",
                "recommendation": "Consolidate into a single primary <h1> and use <h2> or <h3> for sub-sections."
            })

        # 3. Security (HTTPS & headers)
        if not safe_url.startswith("https://"):
            security_points -= 50
            issues.append({
                "severity": "critical",
                "type": "security",
                "title": "Insecure Connection (HTTP)",
                "message": "Site is served over unencrypted HTTP.",
                "recommendation": "Install a valid SSL/TLS certificate and enforce automatic HTTPS redirection."
            })

        # 4. Mobile Friendliness
        if not viewport:
            mobile_points -= 40
            issues.append({
                "severity": "critical",
                "type": "mobile",
                "title": "Missing Viewport Meta Tag",
                "message": "Page lacks <meta name='viewport'>, rendering poorly on mobile devices.",
                "recommendation": "Add <meta name='viewport' content='width=device-width, initial-scale=1.0'>."
            })

        # 5. Performance Latency
        if latency_ms > 2000:
            performance_points -= 30
            issues.append({
                "severity": "warning",
                "type": "performance",
                "title": "High Server Response Latency",
                "message": f"Initial page response took {latency_ms}ms (recommended < 600ms).",
                "recommendation": "Enable server-side caching, optimize database queries, or use a CDN."
            })
        elif latency_ms > 1000:
            performance_points -= 15

        # Structured Data Check (JSON-LD)
        scripts = soup.find_all("script", attrs={"type": "application/ld+json"})
        schema_types = []
        for s in scripts:
            content = s.string or ""
            if "LocalBusiness" in content:
                schema_types.append("LocalBusiness")
            elif "Organization" in content:
                schema_types.append("Organization")
            elif "@type" in content:
                schema_types.append("StructuredData")

        if not schema_types:
            seo_points -= 15
            issues.append({
                "severity": "warning",
                "type": "seo",
                "title": "Missing LocalBusiness Schema Markup",
                "message": "No structured LocalBusiness or Organization JSON-LD found.",
                "recommendation": "Implement LocalBusiness Schema with address, telephone, openingHours, and geo coordinates."
            })

        # Normalize score components
        seo_score = max(10, min(100, seo_points))
        security_score = max(10, min(100, security_points))
        performance_score = max(10, min(100, performance_points))
        mobile_score = max(10, min(100, mobile_points))

        # Overall composite score
        overall_score = round(
            (seo_score * 0.40) +
            (security_score * 0.20) +
            (performance_score * 0.20) +
            (mobile_score * 0.20)
        )

        return {
            "audited_url": safe_url,
            "overall_score": overall_score,
            "seo_score": seo_score,
            "performance_score": performance_score,
            "security_score": security_score,
            "mobile_score": mobile_score,
            "response_time_ms": latency_ms,
            "status": "completed",
            "summary": f"Audit completed for {safe_url}. Found {len(issues)} issues with an overall health rating of {overall_score}/100.",
            "issues": issues,
            "meta_tags": {
                "title": title_text,
                "title_length": len(title_text),
                "description": desc_text,
                "description_length": len(desc_text),
                "canonical": canonical_href,
                "has_viewport": viewport is not None,
                "has_og_title": og_title is not None,
                "status_code": status_code
            },
            "headings": {
                "h1_count": len(h1_tags),
                "h1_tags": h1_tags[:5],
                "h2_count": len(h2_tags),
                "h2_tags": h2_tags[:8],
            },
            "broken_links": [],
            "schema_markup": schema_types
        }
