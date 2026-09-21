import { useEffect, useState } from "react";
import { RefreshCw, Server } from "lucide-react";
import { api } from "../services/api";

interface ModelResult { model: string; model_version: string; precision: number; recall: number; f1: number; roc_auc: number; pr_auc: number; }

export function LiveModelPage() {
  const [models, setModels] = useState<ModelResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    setError(null);
    api.getModelPerformance()
      .then((payload) => setModels((payload as { model_comparison?: ModelResult[] }).model_comparison ?? payload as ModelResult[]))
      .catch(() => setError("Model metrics are unavailable."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  return <><div className="page-header"><div><span className="eyebrow">Model performance</span><h1>Trust, measured</h1><p>Metrics are read from versioned evaluation artifacts. They describe validation performance, not deployed outcomes.</p></div><button className="button secondary" onClick={load}><RefreshCw size={15} /> Refresh</button></div>{loading ? <div className="loading-state"><RefreshCw className="spin" size={20} /> Loading model metrics...</div> : error ? <div className="error-state"><Server size={22} /><h2>Model metrics unavailable</h2><p>{error}</p><button className="button primary" onClick={load}>Retry</button></div> : <section className="panel"><div className="panel-heading"><div><span className="eyebrow">Evaluation artifacts</span><h2>Model comparison</h2></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Model</th><th>Precision</th><th>Recall</th><th>F1</th><th>ROC-AUC</th><th>PR-AUC</th></tr></thead><tbody>{models.map((model) => <tr key={model.model_version}><td><b>{model.model}</b><small>{model.model_version}</small></td><td>{model.precision}</td><td>{model.recall}</td><td>{model.f1}</td><td>{model.roc_auc}</td><td>{model.pr_auc}</td></tr>)}</tbody></table>{!models.length && <div className="empty-state">No model comparison artifact found.</div>}</div></section>}</>;
}
