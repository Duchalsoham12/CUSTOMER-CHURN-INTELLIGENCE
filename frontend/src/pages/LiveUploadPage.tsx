import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { ArrowRight, CheckCircle2, AlertTriangle, RefreshCw, UploadCloud, FileSpreadsheet, XCircle } from "lucide-react";
import { api } from "../services/api";

interface UploadQualityReport {
  filename: string;
  rows: number;
  columns: string[];
  column_count: number;
  missing_values: Record<string, number>;
  duplicate_rows: number;
  invalid_rows: number;
  invalid_values: number;
  quality_status: "ready" | "review";
}

export function LiveUploadPage() {
  const [report, setReport] = useState<UploadQualityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a valid .csv file.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = (await api.uploadDataset(file)) as UploadQualityReport;
      setReport(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload and validate CSV file.";
      setError(message.includes("400") ? "Invalid CSV format or missing headers." : message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const totalMissing = report
    ? Object.values(report.missing_values).reduce((acc, count) => acc + count, 0)
    : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Data management</span>
          <h1>Bring your data in</h1>
          <p>Upload a real CSV file to run automated schema validation and data-quality profiling via the FastAPI ingestion engine.</p>
        </div>
      </div>

      <div className="upload-grid">
        <div
          className={`upload-dropzone ${dragOver ? "drag-over" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          style={{ cursor: "pointer" }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileInputChange}
            accept=".csv"
            style={{ display: "none" }}
          />
          <div className="upload-icon">
            {loading ? (
              <RefreshCw className="spin" size={28} />
            ) : report ? (
              <FileSpreadsheet size={28} />
            ) : (
              <UploadCloud size={28} />
            )}
          </div>
          <h2>
            {loading
              ? "Validating dataset..."
              : report
              ? report.filename
              : "Drop your CSV here"}
          </h2>
          <p>
            {loading
              ? "Profiling schema, checking missing values, and detecting duplicates..."
              : report
              ? "Validation complete. Real data quality report generated below."
              : "or click to browse from your computer"}
          </p>
          <button
            type="button"
            className="button primary"
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {report ? "Upload different file" : "Choose CSV file"}
          </button>
          <small>CSV only · Max 10 MB · Validated with backend /api/upload</small>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Validation status</span>
              <h2>Data quality report</h2>
            </div>
            {report && (
              <span
                className={`status-badge ${
                  report.quality_status === "ready" ? "status-low" : "status-high"
                }`}
              >
                {report.quality_status === "ready" ? "Quality Ready" : "Review Recommended"}
              </span>
            )}
          </div>

          {error && (
            <div className="error-state" style={{ padding: "16px", margin: "10px 0" }}>
              <XCircle size={20} color="#dc2626" />
              <h3>Upload validation error</h3>
              <p>{error}</p>
            </div>
          )}

          {!report && !error && !loading && (
            <div className="empty-state">
              <p>No file uploaded yet. Upload a CSV to view real schema validation metrics.</p>
            </div>
          )}

          {report && (
            <div className="quality-list">
              <span>
                <b>Filename</b>
                <strong>{report.filename}</strong>
                <em className="ready">Validated</em>
              </span>
              <span>
                <b>Rows detected</b>
                <strong>{report.rows.toLocaleString()}</strong>
                <em className="ready">Real count</em>
              </span>
              <span>
                <b>Columns detected</b>
                <strong>{report.column_count}</strong>
                <em className="ready">{report.columns.slice(0, 3).join(", ")}...</em>
              </span>
              <span>
                <b>Missing values</b>
                <strong>{totalMissing.toLocaleString()}</strong>
                <em className={totalMissing > 0 ? "" : "ready"}>
                  {totalMissing > 0 ? "Review fields" : "Clean"}
                </em>
              </span>
              <span>
                <b>Duplicate rows</b>
                <strong>{report.duplicate_rows}</strong>
                <em className={report.duplicate_rows > 0 ? "" : "ready"}>
                  {report.duplicate_rows > 0 ? "Attention" : "Zero"}
                </em>
              </span>
              <span>
                <b>Invalid row values</b>
                <strong>{report.invalid_rows}</strong>
                <em className={report.invalid_rows > 0 ? "" : "ready"}>
                  {report.invalid_rows > 0 ? "Malformed" : "Passed"}
                </em>
              </span>
            </div>
          )}
        </section>
      </div>

      <div className="pipeline">
        <span>1. Upload</span>
        <ArrowRight size={15} />
        <span>2. Validate</span>
        <ArrowRight size={15} />
        <span>3. Clean</span>
        <ArrowRight size={15} />
        <span>4. Analyze</span>
        <ArrowRight size={15} />
        <span>5. Predict</span>
      </div>
    </>
  );
}
