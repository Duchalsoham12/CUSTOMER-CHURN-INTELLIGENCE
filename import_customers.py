import json
from pathlib import Path
import subprocess

rows = [
    json.loads(line)
    for line in Path("data/raw/full.jsonl").read_text(encoding="utf-8").splitlines()
    if line.strip()
]

sql_lines = ["BEGIN;"]

for r in rows:
    external_id = r["conversation_id"].replace("'", "''")
    persona = r["customer_persona"].replace("'", "''")
    company = r["company_size"].replace("'", "''")

    sql_lines.append(
        f"INSERT INTO customers "
        f"(external_customer_id, customer_persona, company_size) "
        f"VALUES ('{external_id}', '{persona}', '{company}') "
        f"ON CONFLICT (external_customer_id) DO NOTHING;"
    )

sql_lines.append("COMMIT;")

Path("data/import_customers.sql").write_text(
    "\n".join(sql_lines),
    encoding="utf-8"
)

print(f"Created SQL file for {len(rows)} records.")