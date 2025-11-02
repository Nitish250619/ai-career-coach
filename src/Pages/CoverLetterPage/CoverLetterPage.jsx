import React, { useEffect, useMemo, useState } from "react";
import "./CoverLetterPage.scss";
import CoverPreviewOne from "./CoverPreviewOne/CoverPreviewOne";
import CoverPreviewTwo from "./CoverPreviewTwo/CoverPreviewTwo";
import { exportPreviewToPDF, exportToDocx } from "../../utils/exporters";

/* ======== DND Kit ======== */
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ---------- ENV (Vite + CRA + dev fallback) ---------- */
function resolveEnv() {
  const vite = (typeof import.meta !== "undefined" && import.meta.env) || null;
  const craEnv = (typeof process !== "undefined") || null;
  const key =
    (vite && vite.VITE_GEMINI_KEY) ||
    (craEnv && craEnv.REACT_APP_GEMINI_KEY) ||
    (typeof window !== "undefined" &&
      window.localStorage &&
      window.localStorage.getItem("GEMINI_KEY")) ||
    "";
  return { vite, craEnv, key };
}
const { key: GEMINI_KEY } = resolveEnv();
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/* ---------- Tabs ---------- */
const TABS = [
  { key: "info", label: "Information" },
  { key: "t1", label: "Template One" },
  { key: "t2", label: "Template Two" },
];

/* ---------- Tone options ---------- */
const TONES = [
  { key: "concise", label: "Concise" },
  { key: "technical", label: "Technical" },
  { key: "leadership", label: "Leadership" },
  { key: "impact", label: "Impact-heavy" },
];

const initialLetter = {
  applicant: {
    name: "Aarav Sharma",
    title: "Frontend Engineer",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    linkedin: "linkedin.com/in/aarav",
    website: "aarav.dev",
  },
  job: {
    company: "Esri",
    role: "Software Development Engineer – Frontend (JavaScript)",
    jobLink: "https://careers.example.com/esri/frontend",
    jobId: "SDE-FE-2025-11",
    companyLocation: "Noida, India",
    recipientName: "Hiring Manager",
    recipientTitle: "",
    recipientEmail: "",
    today: new Date().toISOString().slice(0, 10),
  },
  intro:
    "I’m excited to apply for the Frontend Engineer role at Esri. With 4+ years building performant React apps and design systems, I’m confident I can help deliver intuitive mapping experiences at scale.",
  paragraphs: [
    {
      id: "p-1",
      text:
        "At TeleLink, I led a React 18 migration and introduced RTK Query, reducing API load times by 32% while improving cache hit rates. I also drove LCP from 3.8s → 1.9s on low-end devices by optimizing critical rendering paths and image delivery.",
    },
    {
      id: "p-2",
      text:
        "I shipped a multi-tenant design system used by six applications, adding accessible components and strong theming primitives. I paired this with visual regression tests in Playwright, cutting UI regressions in CI by 40%.",
    },
  ],
  closing:
    "I’d love to discuss how I can contribute to Esri’s mission. Thank you for your time—looking forward to connecting.",
  signOff: "Sincerely",
};

/* ---------- Sortable item (drag handle) ---------- */
function SortablePara({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="para-card">
      <div className="drag-row">
        <button className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">⠿</button>
      </div>
      {children}
    </div>
  );
}

/* ---------- helpers ---------- */
const newId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now()}`;

const toneHint = (t) => {
  switch (t) {
    case "technical":
      return "Prefer technical specificity (APIs, protocols, tools, performance metrics). Expand acronyms once.";
    case "leadership":
      return "Highlight ownership, cross-team influence, roadmap delivery, mentoring, stakeholder outcomes.";
    case "impact":
      return "Emphasize measurable impact (KPIs, adoption, latency, revenue). Keep lines punchy.";
    default:
      return "Keep it concise, ATS-friendly, and easy to scan.";
  }
};

async function callGemini(systemPrompt, userContent) {
  if (!GEMINI_KEY) {
    alert("Gemini API key missing. Add VITE_GEMINI_KEY or REACT_APP_GEMINI_KEY in .env.");
    return null;
  }
  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userContent}` }] }],
        generationConfig: { temperature: 0.4 },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Gemini HTTP error:", res.status, err);
      alert(`Gemini error ${res.status}. See console for details.`);
      return null;
    }
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";
    return text;
  } catch (e) {
    console.error(e);
    alert("AI improvement failed. Check console/network.");
    return null;
  }
}

const safeParseJSON = (raw) => {
  if (!raw) return null;
  const fenced = raw.match(/```json([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  try {
    return JSON.parse(candidate);
  } catch {
    const firstBrace = candidate.indexOf("{");
    const lastBrace = candidate.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

const CoverLetterPage = () => {
  const [active, setActive] = useState("info");
  const [tone, setTone] = useState("concise");
  const [data, setData] = useState(initialLetter);
  const [loadingAI, setLoadingAI] = useState({
    intro: false,
    closing: false,
    paraByIdx: {},
    allParas: false,
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    // backfill ids if any missing
    setData((prev) => ({
      ...prev,
      paragraphs: (prev.paragraphs || []).map((p) => (p.id ? p : { ...p, id: newId("p") })),
    }));
  }, []);

  const currentFileBase = useMemo(() => {
    const base = `${data?.applicant?.name || "Cover"} - ${active.toUpperCase()}`;
    return base.replace(/\s+/g, " ").trim();
  }, [data, active]);

  const handleDownloadPDF = async () => {
    const id = `preview-${active}`;
    await exportPreviewToPDF(id, `${currentFileBase}.pdf`);
  };

  const handleDownloadDocx = async () => {
    // Reuse exporter; your util can branch on data shape or just dump plain text
    await exportToDocx({ type: "cover-letter", ...data }, `${currentFileBase}.docx`);
  };

  /* ---------- CRUD ---------- */
  const updateApplicant = (k, v) =>
    setData((d) => ({ ...d, applicant: { ...d.applicant, [k]: v } }));

  const updateJob = (k, v) =>
    setData((d) => ({ ...d, job: { ...d.job, [k]: v } }));

  const addParagraph = () =>
    setData((d) => ({ ...d, paragraphs: [...(d.paragraphs || []), { id: newId("p"), text: "" }] }));

  const removeParagraph = (idx) =>
    setData((d) => ({ ...d, paragraphs: d.paragraphs.filter((_, i) => i !== idx) }));

  const updateParagraph = (idx, val) =>
    setData((d) => {
      const next = [...d.paragraphs];
      next[idx] = { ...next[idx], text: val };
      return { ...d, paragraphs: next };
    });

  /* ---------- DnD ---------- */
  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = data.paragraphs.findIndex((p) => p.id === active.id);
    const newIndex = data.paragraphs.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setData((d) => ({ ...d, paragraphs: arrayMove(d.paragraphs, oldIndex, newIndex) }));
  };

  /* ---------- AI: Intro / Para / Closing ---------- */
  const improveIntro = async () => {
    setLoadingAI((s) => ({ ...s, intro: true }));
    const prompt = [
      "Rewrite this cover letter opening in 2-3 crisp sentences.",
      "Tie my experience directly to the target role/company, avoid fluff.",
      toneHint(tone),
      "Return the paragraph only (no greetings/sign-offs).",
    ].join("\n");
    const resp = await callGemini(prompt, [
      `Target Company: ${data.job.company}`,
      `Target Role: ${data.job.role}`,
      `Applicant Title: ${data.applicant.title}`,
      "",
      data.intro || "",
    ].join("\n"));
    if (resp) setData((d) => ({ ...d, intro: resp.trim() }));
    setLoadingAI((s) => ({ ...s, intro: false }));
  };

  const buildParaPrompt = (idx) =>
    [
      `You are optimizing body paragraph #${idx + 1} of a cover letter.`,
      toneHint(tone),
      "Keep 2-4 sentences; be specific, add reasonable measurable impact; avoid repetition; keep it truthful.",
      "Return paragraph only.",
      "",
      `Company: ${data.job.company}`,
      `Role: ${data.job.role}`,
      `My stack/themes: React, TypeScript, RTL/Jest, Playwright, perf, design systems`,
    ].join("\n");

  const improveParagraphOne = async (idx) => {
    setLoadingAI((s) => ({ ...s, paraByIdx: { ...s.paraByIdx, [idx]: true } }));
    const prompt = buildParaPrompt(idx);
    const resp = await callGemini(prompt, data.paragraphs[idx]?.text || "");
    if (resp) {
      updateParagraph(idx, resp.trim());
    }
    setLoadingAI((s) => ({ ...s, paraByIdx: { ...s.paraByIdx, [idx]: false } }));
  };

  const improveAllParagraphs = async () => {
    setLoadingAI((s) => ({ ...s, allParas: true }));
    const prompt = [
      "Rewrite each paragraph for clarity, impact, and specificity (2-4 sentences each).",
      toneHint(tone),
      "Return paragraphs separated by a single blank line. Do NOT add greetings or sign-offs.",
    ].join("\n");
    const raw = (data.paragraphs || []).map((p, i) => `Para ${i + 1}:\n${p.text}`).join("\n\n");
    const resp = await callGemini(prompt, raw);
    if (resp) {
      const parts = resp.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
      setData((d) => {
        const next = [...(d.paragraphs || [])];
        for (let i = 0; i < next.length && i < parts.length; i++) {
          next[i] = { ...next[i], text: parts[i] };
        }
        return { ...d, paragraphs: next };
      });
    }
    setLoadingAI((s) => ({ ...s, allParas: false }));
  };

  const improveClosing = async () => {
    setLoadingAI((s) => ({ ...s, closing: true }));
    const prompt = [
      "Rewrite the closing for a confident, warm tone in 1-2 sentences.",
      "Include a subtle call to action for an interview; avoid clichés; no repetition.",
      toneHint(tone),
      "Return closing only (no sign-off).",
    ].join("\n");
    const resp = await callGemini(prompt, data.closing || "");
    if (resp) setData((d) => ({ ...d, closing: resp.trim() }));
    setLoadingAI((s) => ({ ...s, closing: false }));
  };

  return (
    <div className="cover-create dark-elegant">
      <h1>Cover Letter Builder</h1>

      {/* Tone selector */}
      <div className="tone-bar">
        <span className="label">Tone:</span>
        <div className="tone-group">
          {TONES.map((t) => (
            <button
              key={t.key}
              className={`tone-btn ${tone === t.key ? "active" : ""}`}
              onClick={() => setTone(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${active === t.key ? "active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-body">
        {active === "info" && (
          <div className="info-form">
            {/* Applicant */}
            <fieldset className="fieldset">
              <legend>Applicant</legend>
              <div className="grid">
                {Object.entries(data.applicant).map(([k, v]) => (
                  <label className="field" key={k}>
                    <span className="label">{k[0].toUpperCase() + k.slice(1)}</span>
                    <input
                      className="input"
                      value={v}
                      onChange={(e) => updateApplicant(k, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Job / Company */}
            <fieldset className="fieldset">
              <legend>Target Job</legend>
              <div className="grid">
                {Object.entries(data.job).map(([k, v]) => (
                  <label className="field" key={k}>
                    <span className="label">{k[0].toUpperCase() + k.slice(1)}</span>
                    <input
                      className="input"
                      value={v}
                      onChange={(e) => updateJob(k, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Opening */}
            <fieldset className="fieldset">
              <legend>Opening Paragraph</legend>
              <textarea
                className="textarea"
                rows={4}
                value={data.intro}
                onChange={(e) => setData((d) => ({ ...d, intro: e.target.value }))}
                placeholder="Strong, tailored opening..."
              />
              <button className="btn btn-ai" onClick={improveIntro} disabled={loadingAI.intro}>
                {loadingAI.intro ? "Improving..." : "Improve Opening using AI"}
              </button>
            </fieldset>

            {/* Body paragraphs (DnD + per-para AI + improve all) */}
            <fieldset className="fieldset">
              <legend>Body Paragraphs (drag to reorder)</legend>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext
                  items={(data.paragraphs || []).map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {(data.paragraphs || []).map((p, idx) => (
                    <SortablePara id={p.id} key={p.id}>
                      <div className="card">
                        <label className="field">
                          <span className="label">Paragraph {idx + 1}</span>
                          <textarea
                            className="textarea"
                            rows={4}
                            value={p.text}
                            onChange={(e) => updateParagraph(idx, e.target.value)}
                            placeholder="2–4 sentence paragraph..."
                          />
                        </label>
                        <div className="row end" style={{ gap: 8 }}>
                          <button
                            type="button"
                            className="btn btn-ai"
                            onClick={() => improveParagraphOne(idx)}
                            disabled={!!loadingAI.paraByIdx[idx]}
                            title="Improve only this paragraph using AI"
                          >
                            {loadingAI.paraByIdx[idx] ? "Improving…" : "Improve this paragraph"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-danger"
                            onClick={() => removeParagraph(idx)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </SortablePara>
                  ))}
                </SortableContext>
              </DndContext>

              <button type="button" className="btn btn-outline" onClick={addParagraph}>
                + Add paragraph
              </button>

              <div className="ai-improve-wrap">
                <button className="btn btn-ai" onClick={improveAllParagraphs} disabled={loadingAI.allParas}>
                  {loadingAI.allParas ? "Improving…" : "Improve All Paragraphs using AI"}
                </button>
              </div>
            </fieldset>

            {/* Closing */}
            <fieldset className="fieldset">
              <legend>Closing & Sign-off</legend>
              <label className="field">
                <span className="label">Closing</span>
                <textarea
                  className="textarea"
                  rows={3}
                  value={data.closing}
                  onChange={(e) => setData((d) => ({ ...d, closing: e.target.value }))}
                  placeholder="Confident, warm close with CTA…"
                />
              </label>
              <div className="row two">
                <label className="field">
                  <span className="label">Sign-off</span>
                  <input
                    className="input"
                    value={data.signOff}
                    onChange={(e) => setData((d) => ({ ...d, signOff: e.target.value }))}
                    placeholder="Sincerely / Best regards"
                  />
                </label>
              </div>
              <button className="btn btn-ai" onClick={improveClosing} disabled={loadingAI.closing}>
                {loadingAI.closing ? "Improving…" : "Improve Closing using AI"}
              </button>
            </fieldset>

            <small className="hint">Tip: switch to a preview tab to see changes live and export as PDF/Word.</small>
          </div>
        )}

        {/* Preview actions */}
        {active !== "info" && (
          <div className="preview-header">
            <div className="actions">
              <button className="btn" onClick={handleDownloadPDF}>Download PDF</button>
              <button className="btn" onClick={handleDownloadDocx}>Download Word</button>
            </div>
          </div>
        )}

        {/* Previews */}
        {active === "t1" && <CoverPreviewOne id="preview-t1" data={data} />}
        {active === "t2" && <CoverPreviewTwo id="preview-t2" data={data} />}
      </div>
    </div>
  );
};

export default CoverLetterPage;
