"""Train a leakage-aware churn-risk classification baseline.

The source risk label is the target. Conversation text, summaries, churn signals,
and the source risk label are excluded to avoid target leakage in this baseline.
"""

import json
from pathlib import Path

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, average_precision_score, classification_report, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, label_binarize


ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "data" / "raw" / "full.jsonl"
OUTPUT_PATH = ROOT / "ml" / "artifacts" / "baseline_metrics.json"
TARGET = "churn_risk_level"
EXCLUDED_COLUMNS = {
    TARGET,
    "conversation_id",
    "conversation",
    "summary",
    "churn_signals",
    "sentiment_arc",
    "resolution_outcome",
}


def train_baseline() -> dict[str, object]:
    frame = pd.read_json(DATA_PATH, lines=True)
    frame = frame.dropna(subset=[TARGET])
    features = frame.drop(columns=[column for column in EXCLUDED_COLUMNS if column in frame.columns])
    target = frame[TARGET]

    numeric_columns = features.select_dtypes(include="number").columns.tolist()
    categorical_columns = [column for column in features.columns if column not in numeric_columns]
    preprocessing = ColumnTransformer(
        transformers=[
            ("numeric", SimpleImputer(strategy="median"), numeric_columns),
            ("categorical", Pipeline([
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("encoder", OneHotEncoder(handle_unknown="ignore")),
            ]), categorical_columns),
        ]
    )
    model = Pipeline([
        ("preprocessing", preprocessing),
        ("classifier", RandomForestClassifier(n_estimators=300, class_weight="balanced", random_state=42, n_jobs=-1)),
    ])
    train_features, test_features, train_target, test_target = train_test_split(
        features, target, test_size=0.2, random_state=42, stratify=target
    )
    model.fit(train_features, train_target)
    predictions = model.predict(test_features)
    probabilities = model.predict_proba(test_features)
    classes = model.classes_
    binary_target = label_binarize(test_target, classes=classes)

    metrics = {
        "model": "random_forest",
        "target": TARGET,
        "excluded_columns": sorted(EXCLUDED_COLUMNS),
        "train_rows": len(train_features),
        "test_rows": len(test_features),
        "accuracy": round(float(accuracy_score(test_target, predictions)), 4),
        "macro_f1": round(float(f1_score(test_target, predictions, average="macro")), 4),
        "roc_auc_ovr": round(float(roc_auc_score(binary_target, probabilities, multi_class="ovr")), 4),
        "pr_auc_macro": round(float(average_precision_score(binary_target, probabilities, average="macro")), 4),
        "classification_report": classification_report(test_target, predictions, output_dict=True),
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    result = train_baseline()
    print(json.dumps({key: value for key, value in result.items() if key != "classification_report"}, indent=2))