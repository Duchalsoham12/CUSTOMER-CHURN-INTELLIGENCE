import json
from pathlib import Path

rows = [
    json.loads(line)
    for line in Path("data/raw/full.jsonl")
    .read_text(encoding="utf-8")
    .splitlines()
    if line.strip()
]

sql_lines = ["BEGIN;"]

for r in rows:
    customer_id = r["conversation_id"].replace("'", "''")
    plan_name = r["plan_name"].replace("'", "''")
    plan_type = r["plan_type"].replace("'", "''")

    seats = r["seats"]
    active_seats = r["active_seats"]
    mrr = r["mrr_usd"]

    sql_lines.append(
        f"""
INSERT INTO subscriptions (
    customer_id,
    plan_name,
    plan_type,
    seats,
    active_seats,
    mrr_usd
)
SELECT
    customer_id,
    '{plan_name}',
    '{plan_type}',
    {seats},
    {active_seats},
    {mrr}
FROM customers
WHERE external_customer_id = '{customer_id}'
ON CONFLICT DO NOTHING;
""".strip()
    )

sql_lines.append("COMMIT;")

Path("data/import_subscriptions.sql").write_text(
    "\n".join(sql_lines),
    encoding="utf-8"
)

print(f"Created SQL file for {len(rows)} subscriptions.")