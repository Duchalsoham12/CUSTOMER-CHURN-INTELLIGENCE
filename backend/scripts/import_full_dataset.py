"""Import the downloaded Hugging Face full.jsonl into PostgreSQL."""

import json
import os
from pathlib import Path

import psycopg


ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "data" / "raw" / "full.jsonl"
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://customer_intelligence:change-me@localhost:15432/customer_intelligence",
)


def import_dataset() -> tuple[int, int]:
    records = [
        json.loads(line)
        for line in DATA_PATH.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    raw_conn_url = DATABASE_URL.replace("postgresql+psycopg://", "postgresql://")
    with psycopg.connect(raw_conn_url) as connection:
        with connection.cursor() as cursor:
            for record in records:
                cursor.execute(
                    """
                    INSERT INTO customers (external_customer_id, customer_persona, company_size)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (external_customer_id) DO UPDATE SET
                        customer_persona = EXCLUDED.customer_persona,
                        company_size = EXCLUDED.company_size
                    RETURNING customer_id
                    """,
                    (record["conversation_id"], record.get("customer_persona"), record.get("company_size")),
                )
                customer_id = cursor.fetchone()[0]
                cursor.execute(
                    """
                    INSERT INTO subscriptions (customer_id, plan_name, plan_type, seats, active_seats, mrr_usd)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (customer_id, plan_name, plan_type, mrr_usd) DO NOTHING
                    """,
                    (
                        customer_id,
                        record.get("plan_name"),
                        record.get("plan_type"),
                        record.get("seats"),
                        record.get("active_seats"),
                        record.get("mrr_usd"),
                    ),
                )
        connection.commit()
    return len(records), len(records)


if __name__ == "__main__":
    customers, subscriptions = import_dataset()
    print(f"Imported {customers} customer records and {subscriptions} subscription records.")