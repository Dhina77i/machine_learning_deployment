import { useState } from "react";

const API_URL = "https://machine-learning-deployment-mdk2.onrender.com/predict";

const fields = [
  { key: "Age", label: "Age", type: "number", placeholder: "e.g. 45", unit: "yrs" },
  { key: "Blood_Pressure", label: "Blood Pressure", type: "number", placeholder: "e.g. 80", unit: "mm/Hg" },
  { key: "Specific_Gravity", label: "Specific Gravity", type: "number", placeholder: "e.g. 1.020", step: "0.001" },
  { key: "Albumin", label: "Albumin", type: "number", placeholder: "0–5", unit: "g/dL" },
  { key: "Sugar", label: "Sugar", type: "number", placeholder: "0–5", unit: "g/dL" },
  { key: "Red_Blood_Cells", label: "Red Blood Cells", type: "select", options: ["normal", "abnormal"] },
  { key: "Pus_Cell", label: "Pus Cell", type: "select", options: ["normal", "abnormal"] },
  { key: "Pus_Cell_Clumps", label: "Pus Cell Clumps", type: "select", options: ["present", "notpresent"] },
  { key: "Bacteria", label: "Bacteria", type: "select", options: ["present", "notpresent"] },
  { key: "Blood_Glucose_Random", label: "Blood Glucose (Random)", type: "number", placeholder: "e.g. 121", unit: "mg/dL" },
  { key: "Blood_Urea", label: "Blood Urea", type: "number", placeholder: "e.g. 36", unit: "mg/dL" },
  { key: "Serum_Creatinine", label: "Serum Creatinine", type: "number", placeholder: "e.g. 1.2", unit: "mg/dL" },
  { key: "Sodium", label: "Sodium", type: "number", placeholder: "e.g. 138", unit: "mEq/L" },
  { key: "Potassium", label: "Potassium", type: "number", placeholder: "e.g. 4.5", unit: "mEq/L" },
  { key: "Hemoglobin", label: "Hemoglobin", type: "number", placeholder: "e.g. 13.5", unit: "g/dL" },
  { key: "Packed_Cell_Volume", label: "Packed Cell Volume", type: "number", placeholder: "e.g. 44" },
  { key: "White_Blood_Cell_Count", label: "WBC Count", type: "number", placeholder: "e.g. 7800", unit: "cells/cumm" },
  { key: "Red_Blood_Cell_Count", label: "RBC Count", type: "number", placeholder: "e.g. 5.2", unit: "millions/cmm" },
  { key: "Hypertension", label: "Hypertension", type: "select", options: ["yes", "no"] },
  { key: "Diabetes_Mellitus", label: "Diabetes Mellitus", type: "select", options: ["yes", "no"] },
  { key: "Coronary_Artery_Disease", label: "Coronary Artery Disease", type: "select", options: ["yes", "no"] },
  { key: "Appetite", label: "Appetite", type: "select", options: ["good", "poor"] },
  { key: "Pedal_Edema", label: "Pedal Edema", type: "select", options: ["yes", "no"] },
  { key: "Anemia", label: "Anemia", type: "select", options: ["yes", "no"] },
];

const initialForm = fields.reduce((acc, f) => {
  acc[f.key] = f.type === "select" ? f.options[0] : "";
  return acc;
}, {});

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);

  const totalSteps = 3;
  const chunkSize = Math.ceil(fields.length / totalSteps);
  const currentFields = fields.slice(step * chunkSize, (step + 1) * chunkSize);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = { ...form };
      fields.forEach(f => {
        if (f.type === "number" && payload[f.key] !== "") {
          payload[f.key] = parseFloat(payload[f.key]);
        } else if (f.type === "number" && payload[f.key] === "") {
          delete payload[f.key];
        }
      });
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.prediction);
    } catch (e) {
      setError(e.message || "Failed to connect to the API.");
    } finally {
      setLoading(false);
    }
  };

  const isCKD = result && result.toLowerCase().includes("ckd") && !result.toLowerCase().includes("notckd");
  const isLast = step === totalSteps - 1;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)",
      fontFamily: "'Georgia', serif",
      color: "#e8eaf0",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        borderBottom: "1px solid rgba(100,180,255,0.15)",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}>
        <div style={{
          width: 42, height: 42,
          background: "linear-gradient(135deg, #1a6fa8, #0ea5e9)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
          boxShadow: "0 0 20px rgba(14,165,233,0.4)"
        }}>🫀</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.5px", color: "#e0f2fe" }}>
            Kidney Disease Predictor
          </div>
          <div style={{ fontSize: 12, color: "#7ea8c9", letterSpacing: "1px", textTransform: "uppercase" }}>
            Clinical ML Diagnostic Tool
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#4a7a99" }}>
          Powered by Render API
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>

        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            {["Basic & Vitals", "Lab Values", "Clinical History"].map((label, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                opacity: i <= step ? 1 : 0.4,
                cursor: "pointer",
                fontSize: 13,
                color: i === step ? "#38bdf8" : "#7ea8c9",
                fontFamily: "'Courier New', monospace",
              }} onClick={() => setStep(i)}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: i < step ? "#0ea5e9" : i === step ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.05)",
                  border: `2px solid ${i === step ? "#38bdf8" : i < step ? "#0ea5e9" : "rgba(255,255,255,0.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  color: i <= step ? "#38bdf8" : "#4a7a99",
                }}>
                  {i < step ? "✓" : i + 1}
                </div>
                {label}
              </div>
            ))}
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
            <div style={{
              height: "100%",
              width: `${((step + 1) / totalSteps) * 100}%`,
              background: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
              borderRadius: 2,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Form Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(100,180,255,0.12)",
          borderRadius: 16,
          padding: "32px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}>
          <h2 style={{
            margin: "0 0 24px 0",
            fontSize: 16,
            color: "#7ea8c9",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontFamily: "'Courier New', monospace",
            fontWeight: 400,
          }}>
            Step {step + 1} — {["Basic & Vitals", "Lab Values", "Clinical History"][step]}
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px",
          }}>
            {currentFields.map(field => (
              <div key={field.key}>
                <label style={{
                  display: "block",
                  fontSize: 11,
                  color: "#5a8aaa",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontFamily: "'Courier New', monospace",
                }}>
                  {field.label} {field.unit && <span style={{ color: "#3a6a88" }}>({field.unit})</span>}
                </label>
                {field.type === "select" ? (
                  <select
                    value={form[field.key]}
                    onChange={e => handleChange(field.key, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(100,180,255,0.2)",
                      borderRadius: 8,
                      color: "#e0f2fe",
                      fontSize: 14,
                      outline: "none",
                      cursor: "pointer",
                      fontFamily: "'Georgia', serif",
                    }}
                  >
                    {field.options.map(opt => (
                      <option key={opt} value={opt} style={{ background: "#0d1b2a" }}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    step={field.step || "any"}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => handleChange(field.key, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(100,180,255,0.2)",
                      borderRadius: 8,
                      color: "#e0f2fe",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "'Georgia', serif",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, alignItems: "center" }}>
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{
                padding: "10px 24px",
                background: "transparent",
                border: "1px solid rgba(100,180,255,0.25)",
                borderRadius: 8,
                color: step === 0 ? "#2a4a5a" : "#7ea8c9",
                cursor: step === 0 ? "not-allowed" : "pointer",
                fontSize: 13,
                letterSpacing: "1px",
                fontFamily: "'Courier New', monospace",
              }}
            >← Back</button>

            {!isLast ? (
              <button
                onClick={() => setStep(s => s + 1)}
                style={{
                  padding: "10px 28px",
                  background: "linear-gradient(135deg, #0369a1, #0ea5e9)",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  letterSpacing: "1px",
                  fontFamily: "'Courier New', monospace",
                  boxShadow: "0 4px 20px rgba(14,165,233,0.3)",
                }}
              >Continue →</button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: "12px 36px",
                  background: loading ? "rgba(14,165,233,0.3)" : "linear-gradient(135deg, #0369a1, #0ea5e9)",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 14,
                  letterSpacing: "1.5px",
                  fontFamily: "'Courier New', monospace",
                  boxShadow: loading ? "none" : "0 4px 24px rgba(14,165,233,0.4)",
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? "⏳ Analyzing..." : "🔬 Run Prediction"}
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 24,
            padding: "16px 20px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            color: "#fca5a5",
            fontSize: 13,
            fontFamily: "'Courier New', monospace",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            marginTop: 28,
            padding: "32px",
            background: isCKD
              ? "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(185,28,28,0.08))"
              : "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.08))",
            border: `1px solid ${isCKD ? "rgba(239,68,68,0.35)" : "rgba(16,185,129,0.35)"}`,
            borderRadius: 16,
            textAlign: "center",
            boxShadow: isCKD
              ? "0 10px 40px rgba(239,68,68,0.15)"
              : "0 10px 40px rgba(16,185,129,0.15)",
            animation: "fadeIn 0.5s ease",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {isCKD ? "⚠️" : "✅"}
            </div>
            <div style={{
              fontSize: 13,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: isCKD ? "#fca5a5" : "#6ee7b7",
              fontFamily: "'Courier New', monospace",
              marginBottom: 8,
            }}>
              Prediction Result
            </div>
            <div style={{
              fontSize: 32,
              fontWeight: 700,
              color: isCKD ? "#ef4444" : "#10b981",
              letterSpacing: "1px",
              marginBottom: 12,
            }}>
              {result === "ckd" ? "Chronic Kidney Disease" : "Not CKD"}
            </div>
            <div style={{
              fontSize: 13,
              color: isCKD ? "#fca5a5" : "#6ee7b7",
              opacity: 0.7,
              maxWidth: 400,
              margin: "0 auto",
              lineHeight: 1.6,
            }}>
              {isCKD
                ? "The model indicates a high likelihood of Chronic Kidney Disease. Please consult a nephrologist for further evaluation."
                : "The model indicates no signs of Chronic Kidney Disease based on the provided parameters."}
            </div>
            <div style={{
              marginTop: 16,
              fontSize: 11,
              color: "#3a6a88",
              fontFamily: "'Courier New', monospace",
            }}>
              ⚕ This is an AI-assisted prediction — not a medical diagnosis.
            </div>
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        input:focus, select:focus { border-color: rgba(56,189,248,0.5) !important; box-shadow: 0 0 0 2px rgba(56,189,248,0.1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        option { background: #0d1b2a; }
      `}</style>
    </div>
  );
}
