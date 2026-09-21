from typing import Any

from app.data.pipeline import run_pipeline


def association_report() -> dict[str, Any]:
    rows = run_pipeline()["rows"]
    return {"analyses": [{"hypothesis": "Observed churn labels differ by plan type", "test": "Descriptive comparison", "statistic": None, "p_value": None, "effect_size": None, "interpretation": "Inferential tests are withheld because this dataset has observed risk labels but no independent churn outcome event or dates.", "limitations": "Association is not causation; source labels may encode assessment decisions."}], "sample_size": len(rows)}