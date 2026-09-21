import csv
import io
import re
from collections import Counter

from fastapi import APIRouter, File, HTTPException, UploadFile, status

router = APIRouter(prefix="/upload", tags=["data"])
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_UPLOAD_ROWS = 100_000


@router.post("", status_code=status.HTTP_200_OK)
async def upload_csv(file: UploadFile = File(...)) -> dict[str, object]:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="CSV file must be 10 MB or smaller.")
    if not contents.strip():
        raise HTTPException(status_code=400, detail="The uploaded CSV is empty.")

    try:
        text = contents.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text))
        columns = reader.fieldnames or []
        if not columns or any(not column.strip() for column in columns):
            raise ValueError("The CSV must contain a header row with named columns.")

        rows = []
        for row in reader:
            rows.append(row)
            if len(rows) > MAX_UPLOAD_ROWS:
                raise ValueError("CSV row limit exceeded.")
    except (UnicodeDecodeError, csv.Error, ValueError) as error:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {error}") from error

    missing_values = {
        column: sum(not (row.get(column) or "").strip() for row in rows)
        for column in columns
    }
    row_signatures = [tuple((row.get(column) or "").strip() for column in columns) for row in rows]
    duplicate_rows = sum(count - 1 for count in Counter(row_signatures).values() if count > 1)
    invalid_rows = sum(len(row) != len(columns) for row in rows)

    return {
        "filename": re.sub(r"[^A-Za-z0-9_.-]", "_", file.filename),
        "rows": len(rows),
        "columns": columns,
        "column_count": len(columns),
        "missing_values": missing_values,
        "duplicate_rows": duplicate_rows,
        "invalid_rows": invalid_rows,
        "invalid_values": invalid_rows,
        "quality_status": "review" if duplicate_rows or invalid_rows or any(missing_values.values()) else "ready",
    }