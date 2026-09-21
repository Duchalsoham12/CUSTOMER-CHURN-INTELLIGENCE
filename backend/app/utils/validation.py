from pathlib import Path


def validate_csv_filename(filename: str | None) -> None:
    if not filename or Path(filename).suffix.lower() != ".csv":
        raise ValueError("Only CSV files are supported.")