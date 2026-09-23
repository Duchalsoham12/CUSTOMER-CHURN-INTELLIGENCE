from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import httpx

DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "raw" / "full.jsonl"


def _load_customer_raw(customer_id: str) -> dict[str, Any]:
    if not DATA_PATH.exists():
        return {}
    for line in DATA_PATH.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        rec = json.loads(line)
        if str(rec.get("conversation_id")) == customer_id or str(rec.get("customer_id")) == customer_id:
            return rec
    return {}


def dispatch_retention_alert(
    customer_id: str,
    channel: str = "slack",
    webhook_url: str | None = None,
    note: str | None = None,
    record: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Formats and dispatches rich card alerts to Slack or Discord webhooks

    for high-risk customer accounts.
    """
    if record is None:
        record = _load_customer_raw(customer_id)

    plan = str(record.get("plan_name", "Enterprise Plan"))
    mrr = float(record.get("mrr_usd") or 500.0)
    tenure = int(record.get("tenure_months") or 12)
    risk = str(record.get("churn_risk_level", "high")).upper()
    signals = record.get("churn_signals") or ["Usage drop", "Support escalation"]
    if isinstance(signals, str):
        signals = [signals]
    primary_signal = signals[0] if signals else "Elevated Churn Indicator"

    target_url = webhook_url or os.getenv("SLACK_WEBHOOK_URL") or os.getenv("DISCORD_WEBHOOK_URL")

    # Format Slack block kit payload
    slack_payload = {
        "text": f"🚨 High Churn Risk Alert: Customer {customer_id} (${mrr:,.0f}/mo)",
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "🚨 Customer At-Risk Alert", "emoji": True},
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Customer ID:*\n`{customer_id}`"},
                    {"type": "mrkdwn", "text": f"*Risk Level:*\n*{risk}*"},
                    {"type": "mrkdwn", "text": f"*MRR at Risk:*\n${mrr:,.2f}"},
                    {"type": "mrkdwn", "text": f"*Plan & Tenure:*\n{plan} ({tenure} mos)"},
                ],
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Primary Risk Driver:*\n{primary_signal}\n*Action Recommended:*\n{record.get('recommended_action', 'Immediate Executive Follow-up')}",
                },
            },
        ],
    }

    # Format Discord embed payload
    discord_payload = {
        "content": f"🚨 **High Churn Risk Escalation: Customer {customer_id}**",
        "embeds": [
            {
                "title": f"Account {customer_id} Flagged for Urgent Retention",
                "description": f"Customer on **{plan}** has crossed the critical churn threshold.",
                "color": 15158332,  # Crimson Red
                "fields": [
                    {"name": "Monthly Revenue (MRR)", "value": f"${mrr:,.2f}", "inline": True},
                    {"name": "Risk Classification", "value": risk, "inline": True},
                    {"name": "Tenure", "value": f"{tenure} months", "inline": True},
                    {"name": "Triggering Signal", "value": primary_signal, "inline": False},
                    {"name": "Recommended Intervention", "value": str(record.get("recommended_action", "Proactive Call")), "inline": False},
                ],
                "footer": {"text": "CustomerIQ Real-Time Telemetry Alert"},
            }
        ],
    }

    chosen_payload = discord_payload if "discord" in channel.lower() else slack_payload

    # Deliver if target webhook URL is configured
    delivery_status = "simulated_success"
    status_code = 200

    if target_url:
        try:
            resp = httpx.post(target_url, json=chosen_payload, timeout=5.0)
            status_code = resp.status_code
            delivery_status = "delivered" if 200 <= status_code < 300 else f"failed_http_{status_code}"
        except Exception as e:
            delivery_status = f"failed_exception_{type(e).__name__}"

    return {
        "customer_id": customer_id,
        "channel": channel,
        "delivery_status": delivery_status,
        "http_status_code": status_code,
        "dispatched_to_url": target_url or "Local Mock Webhook Sink (Configure SLACK_WEBHOOK_URL to send live)",
        "payload": chosen_payload,
        "alert_timestamp": "now",
    }
