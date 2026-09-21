# ML pipeline for customer churn prediction

This module provides a leakage-aware churn prediction workflow built from the live customer dataset in `data/raw/full.jsonl`.

## Structure

- `ml/data/` — dataset loaders and validation helpers.
- `ml/preprocessing/` — feature extraction and preprocessing utilities.
- `ml/training/` — training notebooks and scripts.
- `ml/evaluation/` — reporting and comparison scripts.
- `ml/explainability/` — SHAP-based diagnostics.
- `ml/inference/` — live prediction entry points.
- `ml/artifacts/` — persisted models, metrics, and metadata.

## Important constraints

- No target leakage: `churn_risk_level`, text fields, and outcome metadata are excluded from predictive features.
- Model artifacts are persisted under `ml/artifacts/` and loaded by the backend API.
- Predictions are probabilistic estimates from a real trained model and are not causal explanations.
