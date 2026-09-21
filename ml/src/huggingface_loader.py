"""Download a configured Hugging Face dataset without persisting credentials."""

import argparse
import os
from pathlib import Path

from datasets import DatasetDict, load_dataset


DEFAULT_DATASET_ID = "ConsumerDividends/Customer-Churn-Dataset-V2"
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"


def load_customer_dataset(
    dataset_id: str | None = None,
    config: str | None = None,
    split: str | None = None,
    token: str | None = None,
):
    """Load a dataset from Hugging Face using environment-backed configuration."""
    dataset_id = dataset_id or os.getenv("HF_DATASET_ID", DEFAULT_DATASET_ID)
    config = config or os.getenv("HF_DATASET_CONFIG") or None
    split = split or os.getenv("HF_DATASET_SPLIT") or None
    token = token or os.getenv("HF_TOKEN") or None

    arguments: dict[str, object] = {"path": dataset_id}
    if config:
        arguments["name"] = config
    if split:
        arguments["split"] = split
    if token:
        arguments["token"] = token

    return load_dataset(**arguments)


def save_dataset(dataset, output_dir: Path = DEFAULT_OUTPUT_DIR) -> list[Path]:
    """Save downloaded data as Parquet, preserving one file per split."""
    output_dir.mkdir(parents=True, exist_ok=True)
    saved_paths: list[Path] = []
    datasets_by_split = dataset.items() if isinstance(dataset, DatasetDict) else [("data", dataset)]

    for split_name, split_dataset in datasets_by_split:
        output_path = output_dir / f"customer_churn_{split_name}.parquet"
        split_dataset.to_parquet(str(output_path))
        saved_paths.append(output_path)

    return saved_paths


def main() -> None:
    parser = argparse.ArgumentParser(description="Download the configured churn dataset from Hugging Face.")
    parser.add_argument("--dataset-id", default=None)
    parser.add_argument("--config", default=None)
    parser.add_argument("--split", default=None)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()

    dataset = load_customer_dataset(args.dataset_id, args.config, args.split)
    paths = save_dataset(dataset, args.output_dir)
    print(f"Downloaded dataset: {args.dataset_id or os.getenv('HF_DATASET_ID', DEFAULT_DATASET_ID)}")
    print(f"Saved files: {', '.join(str(path) for path in paths)}")


if __name__ == "__main__":
    main()