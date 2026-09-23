import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Download,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Table,
  X,
} from "lucide-react";
import { api } from "../../services/api";
import { downloadCsv } from "../../lib/csv";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  sqlQuery?: string;
  tableData?: any[];
  chartData?: Array<{ name: string; value: number }>;
  chartValueLabel?: string;
  suggestedFollowups?: string[];
  timestamp: string;
}

export function AiChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; label: string; question: string }>>([]);
  const [expandedSql, setExpandedSql] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getAiSuggestions()
      .then(setSuggestions)
      .catch((err) => console.log("Failed to load suggestions", err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.askAiAssistant(q);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: res.answer,
        sqlQuery: res.sql_query,
        tableData: res.table_data,
        chartData: res.chart_data,
        chartValueLabel: res.chart_value_label,
        suggestedFollowups: res.suggested_followups,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: "I encountered an error querying the dataset. Please ensure the backend is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSql = (msgId: string) => {
    setExpandedSql((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleExportTable = (msg: ChatMessage) => {
    if (!msg.tableData?.length) return;
    downloadCsv(`ai-query-result-${Date.now()}.csv`, msg.tableData);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            height: "50px",
            padding: "0 20px",
            borderRadius: "25px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "#ffffff",
            border: "none",
            boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4), 0 8px 10px -6px rgba(99, 102, 241, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "14px",
            zIndex: 90,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Sparkles size={18} />
          <span>Ask CustomerIQ AI</span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "480px",
            height: "680px",
            maxHeight: "calc(100vh - 48px)",
            maxWidth: "calc(100vw - 32px)",
            background: "var(--card-bg, #ffffff)",
            border: "1px solid var(--border-color, #e2e8f0)",
            borderRadius: "20px",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            display: "flex",
            flexDirection: "column",
            zIndex: 99,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>CustomerIQ AI Copilot</h3>
                <small style={{ fontSize: "11px", opacity: 0.85 }}>Natural Language Analytics & Text-to-SQL</small>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setMessages([])}
                title="Clear conversation"
                style={{ background: "none", border: "none", color: "#ffffff", opacity: 0.8, cursor: "pointer", padding: "4px" }}
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                style={{ background: "none", border: "none", color: "#ffffff", opacity: 0.8, cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", background: "var(--page-bg, #f8fafc)" }}>
            
            {/* Welcome message if empty */}
            {messages.length === 0 && (
              <div style={{ padding: "16px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4f46e5", fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>
                  <Sparkles size={16} /> Welcome to your AI Analytics Copilot!
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 14px", lineHeight: 1.5 }}>
                  Ask any question about your customers, churn patterns, high-friction tickets, or portfolio revenue in natural English.
                </p>

                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", marginBottom: "8px" }}>
                  Suggested Questions:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSend(s.question)}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#334155",
                        cursor: "pointer",
                        fontWeight: 500,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.sender === "user" ? "flex-end" : "flex-start",
                  gap: "4px",
                }}
              >
                {/* Bubble */}
                <div
                  style={{
                    maxWidth: "92%",
                    padding: m.sender === "user" ? "10px 14px" : "14px 16px",
                    borderRadius: m.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                    background: m.sender === "user" ? "#4f46e5" : "#ffffff",
                    color: m.sender === "user" ? "#ffffff" : "#1e293b",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                    border: m.sender === "user" ? "none" : "1px solid #e2e8f0",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  {/* Natural language answer text */}
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {m.text.split("\n\n").map((para, i) => (
                      <p key={i} style={{ margin: i === 0 ? 0 : "8px 0 0" }}>
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* SQL Accordion */}
                  {m.sqlQuery && (
                    <div style={{ marginTop: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                      <button
                        onClick={() => toggleSql(m.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#6366f1",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0,
                        }}
                      >
                        <Code2 size={13} />
                        <span>{expandedSql[m.id] ? "Hide Generated SQL" : "View Generated SQL"}</span>
                        {expandedSql[m.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      {expandedSql[m.id] && (
                        <div style={{ marginTop: "6px", position: "relative" }}>
                          <pre
                            style={{
                              background: "#0f172a",
                              color: "#38bdf8",
                              padding: "10px 12px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontFamily: "monospace",
                              overflowX: "auto",
                              margin: 0,
                            }}
                          >
                            {m.sqlQuery}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dynamic Mini Bar Chart */}
                  {m.chartData && m.chartData.length > 0 && (
                    <div style={{ marginTop: "12px", padding: "10px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "8px" }}>
                        {m.chartValueLabel || "Distribution"}:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {m.chartData.map((item) => {
                          const maxVal = Math.max(...m.chartData!.map((c) => c.value), 1);
                          const pct = Math.min(100, Math.max(8, (item.value / maxVal) * 100));
                          return (
                            <div key={item.name} style={{ display: "grid", gridTemplateColumns: "110px 1fr 65px", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                              <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", color: "#334155", fontWeight: 600 }}>
                                {item.name}
                              </span>
                              <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #4f46e5)", borderRadius: "5px" }} />
                              </div>
                              <span style={{ textAlign: "right", fontWeight: 700, color: "#4f46e5" }}>
                                {item.value >= 1000 ? `$${item.value.toLocaleString()}` : item.value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tabular Data View & CSV Download */}
                  {m.tableData && m.tableData.length > 0 && (
                    <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleExportTable(m)}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#475569",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Download size={12} /> Export Table CSV
                      </button>
                    </div>
                  )}

                  {/* Suggested Followups */}
                  {m.suggestedFollowups && m.suggestedFollowups.length > 0 && (
                    <div style={{ marginTop: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", marginBottom: "6px" }}>
                        Suggested Follow-ups:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {m.suggestedFollowups.map((f, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(f)}
                            style={{
                              textAlign: "left",
                              padding: "4px 8px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              fontSize: "11px",
                              color: "#6366f1",
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                          >
                            ↳ {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <small style={{ fontSize: "10px", color: "#94a3b8", padding: "0 4px" }}>{m.timestamp}</small>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#ffffff", borderRadius: "12px", width: "fit-content", border: "1px solid #e2e8f0" }}>
                <RefreshCw className="spin" size={14} color="#6366f1" />
                <span style={{ fontSize: "12px", color: "#64748b" }}>Analyzing dataset & compiling query...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div style={{ padding: "12px 16px", background: "#ffffff", borderTop: "1px solid var(--border-color, #e2e8f0)" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about churn, high risk accounts, plans, MRR..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: input.trim() ? "#4f46e5" : "#e2e8f0",
                  color: "#ffffff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() ? "pointer" : "default",
                  transition: "background 0.15s ease",
                }}
              >
                <ArrowUp size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
