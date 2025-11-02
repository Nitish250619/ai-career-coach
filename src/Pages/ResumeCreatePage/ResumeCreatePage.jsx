import React, { useMemo, useState, useEffect } from "react";
import ClassicPreview from "./ClassicPreview/ClassicPreview";
import ModernPreview from "./ModernPreview/ModernPreview";
import MinimalPreview from "./MinimalPreview/MinimalPreview";
import { exportPreviewToPDF, exportToDocx } from "../../utils/exporters";
import "./ResumeCreatePage.scss";

/* ======== DND Kit ======== */
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ---------- ENV (Vite + CRA + dev fallback) ---------- */
function resolveEnv() {
  const vite = (typeof import.meta !== "undefined" && import.meta.env) || null;
  const craEnv = (typeof process !== "undefined" ) || null;
  const key =
    (vite && vite.VITE_GEMINI_KEY) ||
    (craEnv && craEnv.REACT_APP_GEMINI_KEY) ||
    (typeof window !== "undefined" &&
      window.localStorage &&
      window.localStorage.getItem("GEMINI_KEY")) ||
    "";
  return { vite, craEnv, key };
}
const { vite: __VITE, key: GEMINI_KEY } = resolveEnv();
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/* ---------- Tabs ---------- */
const TABS = [
  { key: "info", label: "Information" },
  { key: "classic", label: "Classic" },
  { key: "modern", label: "Modern" },
  { key: "minimal", label: "Minimal" },
];

/* ---------- Tone options ---------- */
const TONES = [
  { key: "concise", label: "Concise" },
  { key: "technical", label: "Technical" },
  { key: "leadership", label: "Leadership" },
  { key: "impact", label: "Impact-heavy" },
];

const initialData = {
  name: "Aarav Sharma",
  title: "Frontend Engineer",
  summary:
    "Frontend engineer with 4+ years in React, performance tuning, and design systems. Passionate about DX and accessibility.",
  contact: {
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    website: "aarav.dev",
    linkedin: "linkedin.com/in/aarav",
    github: "github.com/aarav",
  },
  skills: ["React", "TypeScript", "Redux", "Jest/RTL", "Node.js", "Webpack", "Vite"],
  experience: [
    {
      id: "exp-1",
      company: "TeleLink",
      role: "Senior Frontend Engineer",
      period: "Jan 2023 – Present",
      bullets: [
        "Led migration to React 18 and RTK Query, reducing API load times by 32%.",
        "Built reusable form kit with Formik + Yup; cut form bugs by 45%.",
        "Drove performance: LCP from 3.8s → 1.9s on 3G.",
      ],
    },
    {
      id: "exp-2",
      company: "PixelCraft",
      role: "Frontend Engineer",
      period: "Aug 2020 – Dec 2022",
      bullets: [
        "Shipped multi-tenant design system consumed by 6+ apps.",
        "Introduced visual regression tests with Playwright.",
      ],
    },
  ],
  education: [
    { school: "IIIT Hyderabad", degree: "B.Tech, Computer Science", period: "2016 – 2020" },
  ],
  achievements: [
    "Won ‘Best Frontend’ at JSConf India Hackathon 2023.",
    "Top 3% on HackerRank Frontend Skill Certification.",
  ],
  projects: [
    {
      id: "proj-1",
      name: "Service Desk & Fault Monitor",
      link: "https://example.com/sdfm",
      details:
        "Real-time incident dashboard for telecom alarms with SLA timers, escalations, and map overlays.",
    },
  ],
};

/* ---------- Sortable item (drag handle) ---------- */
function SortableCard({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <div className="drag-row">
        <button className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">
          ⠿
        </button>
      </div>
      {children}
    </div>
  );
}

const ResumeCreatePage = () => {
  const [active, setActive] = useState("info");
  const [tone, setTone] = useState("concise"); // tone selector
  const [data, setData] = useState(initialData);
  const [loadingAI, setLoadingAI] = useState({
    summary: false,
    projects: false, // all
    achievements: false, // all
    experienceAll: false, // all
    experienceByIdx: {}, // per-role
    projectByIdx: {}, // per-project
  });

  // DND sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Ensure new items get an id
  const newId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now()}`;

  useEffect(() => {
    // backfill ids if any missing
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id ? e : { ...e, id: newId("exp") })),
      projects: prev.projects.map((p) => (p.id ? p : { ...p, id: newId("proj") })),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentFileBase = useMemo(() => {
    const base = `${data?.name || "Resume"} - ${active[0].toUpperCase() + active.slice(1)}`;
    return base.replace(/\s+/g, " ").trim();
  }, [data, active]);

  const handleDownloadPDF = async () => {
    const id = `preview-${active}`;
    await exportPreviewToPDF(id, `${currentFileBase}.pdf`);
  };

  const handleDownloadDocx = async () => {
    await exportToDocx(data, `${currentFileBase}.docx`);
  };

  /* ---------- skills ---------- */
  const updateSkills = (val) =>
    setData({
      ...data,
      skills: val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });

  /* ---------- experience CRUD ---------- */
  const addExperience = () =>
    setData({
      ...data,
      experience: [
        ...data.experience,
        { id: newId("exp"), company: "", role: "", period: "", bullets: [""] },
      ],
    });

  const removeExperience = (idx) =>
    setData({ ...data, experience: data.experience.filter((_, i) => i !== idx) });

  const updateExperience = (idx, field, value) => {
    const next = [...data.experience];
    next[idx] = { ...next[idx], [field]: value };
    setData({ ...data, experience: next });
  };

  const updateExperienceBullet = (idx, bIdx, value) => {
    const next = [...data.experience];
    const bullets = [...(next[idx].bullets || [])];
    bullets[bIdx] = value;
    next[idx].bullets = bullets;
    setData({ ...data, experience: next });
  };

  const addExperienceBullet = (idx) => {
    const next = [...data.experience];
    next[idx].bullets = [...(next[idx].bullets || []), ""];
    setData({ ...data, experience: next });
  };

  const removeExperienceBullet = (idx, bIdx) => {
    const next = [...data.experience];
    next[idx].bullets = next[idx].bullets.filter((_, i) => i !== bIdx);
    setData({ ...data, experience: next });
  };

  /* ---------- education ---------- */
  const addEducation = () =>
    setData({
      ...data,
      education: [...data.education, { school: "", degree: "", period: "" }],
    });

  const removeEducation = (idx) =>
    setData({ ...data, education: data.education.filter((_, i) => i !== idx) });

  const updateEducation = (idx, field, value) => {
    const next = [...data.education];
    next[idx] = { ...next[idx], [field]: value };
    setData({ ...data, education: next });
  };

  /* ---------- achievements ---------- */
  const addAchievement = () =>
    setData({ ...data, achievements: [...(data.achievements || []), ""] });

  const removeAchievement = (idx) =>
    setData({
      ...data,
      achievements: (data.achievements || []).filter((_, i) => i !== idx),
    });

  const updateAchievement = (idx, value) => {
    const next = [...(data.achievements || [])];
    next[idx] = value;
    setData({ ...data, achievements: next });
  };

  /* ---------- projects ---------- */
  const addProject = () =>
    setData({
      ...data,
      projects: [...(data.projects || []), { id: newId("proj"), name: "", link: "", details: "" }],
    });

  const removeProject = (idx) =>
    setData({
      ...data,
      projects: (data.projects || []).filter((_, i) => i !== idx),
    });

  const updateProject = (idx, field, value) => {
    const next = [...(data.projects || [])];
    next[idx] = { ...next[idx], [field]: value };
    setData({ ...data, projects: next });
  };

  /* ---------- DnD handlers ---------- */
  const onDragEndExp = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = data.experience.findIndex((e) => e.id === active.id);
    const newIndex = data.experience.findIndex((e) => e.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setData({ ...data, experience: arrayMove(data.experience, oldIndex, newIndex) });
  };

  const onDragEndProj = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = data.projects.findIndex((e) => e.id === active.id);
    const newIndex = data.projects.findIndex((e) => e.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setData({ ...data, projects: arrayMove(data.projects, oldIndex, newIndex) });
  };

  /* ---------- Gemini base ---------- */
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

  /* ---------- Tone helpers ---------- */
  const toneHint = (t) => {
    switch (t) {
      case "technical":
        return "Prefer technical specificity (APIs, protocols, tools, perf metrics). Keep acronyms expanded once.";
      case "leadership":
        return "Highlight ownership, cross-team influence, roadmap impact, mentoring, and stakeholder outcomes.";
      case "impact":
        return "Emphasize measurable user/business impact (KPIs, revenue, adoption, latency). Keep lines punchy.";
      default:
        return "Keep lines concise, ATS-friendly, and easy to scan.";
    }
  };

  /* ---------- JSON helper ---------- */
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

  /* ---------- Summary AI ---------- */
  const improveSummary = async () => {
    setLoadingAI((s) => ({ ...s, summary: true }));
    const prompt = [
      "Rewrite the following resume summary in 3-4 crisp sentences for a senior frontend engineer role.",
      toneHint(tone),
      "Quantify impact where reasonable. Avoid first person.",
    ].join("\n");
    const improved = await callGemini(prompt, data.summary);
    if (improved) setData({ ...data, summary: improved });
    setLoadingAI((s) => ({ ...s, summary: false }));
  };

  /* ---------- Experience AI ---------- */
  const buildExperiencePromptOne = (exp) =>
    [
      "Rewrite these bullets to be impact-driven, one line each, strong action verbs, add reasonable metrics.",
      toneHint(tone),
      'Return STRICT JSON: { "bullets": ["...", "..."] }',
      "No extra text outside JSON.",
      "",
      `Company: ${exp.company || ""}`,
      `Role: ${exp.role || ""}`,
      `Period: ${exp.period || ""}`,
      `Bullets:\n- ${(exp.bullets || []).join("\n- ")}`,
    ].join("\n");

  const buildExperiencePromptAll = () =>
    [
      "You are optimizing resume experience bullets.",
      toneHint(tone),
      "For each item, rewrite bullets to be impact-driven, one line each, with strong action verbs and reasonable metrics.",
      "Preserve order by `index`. Return STRICT JSON with this shape:",
      "",
      '{ "experiences": [ { "index": <number>, "bullets": ["...", "..."] } ] }',
      "",
      "No extra text outside JSON.",
    ].join("\n");

  const experienceToJSON = (expArray) =>
    JSON.stringify(
      expArray.map((e, idx) => ({
        index: idx,
        company: e.company || "",
        role: e.role || "",
        period: e.period || "",
        bullets: (e.bullets || []).filter(Boolean),
      })),
      null,
      2
    );

  const improveExperienceOne = async (idx) => {
    setLoadingAI((s) => ({ ...s, experienceByIdx: { ...s.experienceByIdx, [idx]: true } }));
    const exp = data.experience[idx];
    const prompt = buildExperiencePromptOne(exp);
    const resp = await callGemini(prompt, "");
    const parsed = safeParseJSON(resp);

    if (parsed?.bullets?.length) {
      const next = [...data.experience];
      next[idx] = { ...next[idx], bullets: parsed.bullets.slice(0, 8) };
      setData({ ...data, experience: next });
    } else if (resp) {
      const lines = resp
        .split("\n")
        .map((l) => l.replace(/^\s*[-•]\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 8);
      if (lines.length) {
        const next = [...data.experience];
        next[idx] = { ...next[idx], bullets: lines };
        setData({ ...data, experience: next });
      }
    }
    setLoadingAI((s) => ({ ...s, experienceByIdx: { ...s.experienceByIdx, [idx]: false } }));
  };

  const improveExperienceAll = async () => {
    setLoadingAI((s) => ({ ...s, experienceAll: true }));
    const prompt = buildExperiencePromptAll();
    const payload = experienceToJSON(data.experience);
    const resp = await callGemini(prompt, payload);
    const parsed = safeParseJSON(resp);

    if (parsed?.experiences?.length) {
      const next = [...data.experience];
      parsed.experiences.forEach((e) => {
        if (
          typeof e?.index === "number" &&
          next[e.index] &&
          Array.isArray(e.bullets) &&
          e.bullets.length
        ) {
          next[e.index] = { ...next[e.index], bullets: e.bullets.slice(0, 8) };
        }
      });
      setData({ ...data, experience: next });
    }
    setLoadingAI((s) => ({ ...s, experienceAll: false }));
  };

  /* ---------- Projects AI ---------- */
  const buildProjectPromptOne = (p) =>
    [
      "Rewrite this project's 'Details' into 1-2 short, impact-focused lines.",
      toneHint(tone),
      'Return STRICT JSON: { "details": "<one or two lines>" }',
      "No extra text outside JSON.",
      "",
      `Name: ${p.name || "-"}`,
      `Link: ${p.link || "-"}`,
      `Details: ${p.details || "-"}`,
    ].join("\n");

  const improveProjectOne = async (idx) => {
    setLoadingAI((s) => ({ ...s, projectByIdx: { ...s.projectByIdx, [idx]: true } }));
    const p = data.projects[idx];
    const prompt = buildProjectPromptOne(p);
    const resp = await callGemini(prompt, "");
    const parsed = safeParseJSON(resp);

    if (parsed?.details) {
      const next = [...data.projects];
      next[idx] = { ...next[idx], details: String(parsed.details).trim() };
      setData({ ...data, projects: next });
    } else if (resp) {
      const lines = resp
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 2)
        .join(" ");
      if (lines) {
        const next = [...data.projects];
        next[idx] = { ...next[idx], details: lines };
        setData({ ...data, projects: next });
      }
    }
    setLoadingAI((s) => ({ ...s, projectByIdx: { ...s.projectByIdx, [idx]: false } }));
  };

  // Keep “Improve all projects” if you like (optional)
  const improveProjects = async () => {
    setLoadingAI((s) => ({ ...s, projects: true }));
    const flat = (data.projects || [])
      .map(
        (p, i) =>
          `Project ${i + 1}:
Name: ${p.name || "-"}
Link: ${p.link || "-"}
Details: ${p.details || "-"}`
      )
      .join("\n\n");
    const prompt = [
      "Rewrite each project's 'Details' into 1-2 short, impact-focused lines.",
      toneHint(tone),
      "Return each project's details in order, separated by a blank line. JSON not required.",
    ].join("\n");
    const improved = await callGemini(prompt, flat);
    if (improved) {
      const parts = improved
        .split(/\n{2,}/)
        .map((s) => s.trim())
        .filter(Boolean);
      const next = [...(data.projects || [])];
      for (let i = 0; i < next.length && i < parts.length; i++) {
        next[i] = { ...next[i], details: parts[i] };
      }
      setData({ ...data, projects: next });
    }
    setLoadingAI((s) => ({ ...s, projects: false }));
  };

  /* ---------- Achievements AI (global) ---------- */
  const improveAchievements = async () => {
    setLoadingAI((s) => ({ ...s, achievements: true }));
    const flat = (data.achievements || [])
      .map((a, i) => `Achievement ${i + 1}: ${a || "-"}`)
      .join("\n");
    const prompt = [
      "Rewrite each achievement into a single concise, impact-focused bullet.",
      toneHint(tone),
      'Return STRICT JSON: { "achievements": ["...", "..."] }',
      "No extra text outside JSON.",
    ].join("\n");
    const resp = await callGemini(prompt, flat);
    const parsed = safeParseJSON(resp);
    if (parsed?.achievements?.length) {
      setData({ ...data, achievements: parsed.achievements.slice(0, 12) });
    }
    setLoadingAI((s) => ({ ...s, achievements: false }));
  };

  return (
    <div className="resume-create dark-elegant">
      <h1>Resume Builder</h1>

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
            {/* Basic */}
            <div className="grid">
              <label className="field">
                <span className="label">Full Name</span>
                <input
                  className="input"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="Your full name"
                />
              </label>

              <label className="field">
                <span className="label">Title</span>
                <input
                  className="input"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="e.g., Frontend Engineer"
                />
              </label>

              <label className="field col-span-2">
                <span className="label">Summary</span>
                <textarea
                  className="textarea"
                  rows={5}
                  value={data.summary}
                  onChange={(e) => setData({ ...data, summary: e.target.value })}
                  placeholder="Short professional summary"
                />
                <button className="btn btn-ai" onClick={improveSummary} disabled={loadingAI.summary}>
                  {loadingAI.summary ? "Improving..." : "Improve using AI"}
                </button>
              </label>
            </div>

            {/* Contact */}
            <fieldset className="fieldset">
              <legend>Contact</legend>
              <div className="grid">
                {Object.entries(data.contact).map(([k, v]) => (
                  <label className="field" key={k}>
                    <span className="label">{k[0].toUpperCase() + k.slice(1)}</span>
                    <input
                      className="input"
                      value={v}
                      onChange={(e) =>
                        setData({ ...data, contact: { ...data.contact, [k]: e.target.value } })
                      }
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Skills */}
            <fieldset className="fieldset">
              <legend>Skills (comma-separated)</legend>
              <input
                className="input"
                value={data.skills.join(", ")}
                onChange={(e) => updateSkills(e.target.value)}
                placeholder="React, TypeScript, Redux, ..."
              />
              <ul className="chips">
                {data.skills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </fieldset>

            {/* Experience (DnD + per-role AI + improve all) */}
            <fieldset className="fieldset">
              <legend>Experience (drag to reorder)</legend>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndExp}>
                <SortableContext
                  items={data.experience.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {data.experience.map((exp, idx) => (
                    <SortableCard id={exp.id} key={exp.id}>
                      <div className="card">
                        <div className="row two">
                          <label className="field">
                            <span className="label">Company</span>
                            <input
                              className="input"
                              value={exp.company}
                              onChange={(e) => updateExperience(idx, "company", e.target.value)}
                            />
                          </label>
                          <label className="field">
                            <span className="label">Role</span>
                            <input
                              className="input"
                              value={exp.role}
                              onChange={(e) => updateExperience(idx, "role", e.target.value)}
                            />
                          </label>
                        </div>

                        <label className="field">
                          <span className="label">Period</span>
                          <input
                            className="input"
                            value={exp.period}
                            onChange={(e) => updateExperience(idx, "period", e.target.value)}
                            placeholder="e.g., Jan 2023 – Present"
                          />
                        </label>

                        <div className="bullets">
                          <div className="bullets-head">
                            <span>Bullets</span>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => addExperienceBullet(idx)}
                              >
                                + Add bullet
                              </button>
                              <button
                                type="button"
                                className="btn btn-ai"
                                onClick={() => improveExperienceOne(idx)}
                                disabled={!!loadingAI.experienceByIdx[idx]}
                                title="Improve only this role using AI"
                              >
                                {loadingAI.experienceByIdx[idx] ? "Improving…" : "Improve this role"}
                              </button>
                            </div>
                          </div>

                          {(exp.bullets || []).map((b, bIdx) => (
                            <div className="row bullet-row" key={bIdx}>
                              <textarea
                                className="textarea"
                                rows={2}
                                value={b}
                                onChange={(e) => updateExperienceBullet(idx, bIdx, e.target.value)}
                                placeholder="Impact-focused line with metrics..."
                              />
                              <button
                                type="button"
                                className="btn btn-ghost btn-danger"
                                onClick={() => removeExperienceBullet(idx, bIdx)}
                                aria-label="Remove bullet"
                                title="Remove"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="row end" style={{ gap: 8 }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-danger"
                            onClick={() => removeExperience(idx)}
                          >
                            Remove company
                          </button>
                        </div>
                      </div>
                    </SortableCard>
                  ))}
                </SortableContext>
              </DndContext>

              <button type="button" className="btn btn-outline" onClick={addExperience}>
                + Add company
              </button>

              <div className="ai-improve-wrap">
                <button
                  className="btn btn-ai"
                  onClick={improveExperienceAll}
                  disabled={loadingAI.experienceAll}
                >
                  {loadingAI.experienceAll ? "Improving all…" : "Improve All Experience using AI"}
                </button>
              </div>
            </fieldset>

            {/* Projects (DnD + per-project AI + improve all) */}
            <fieldset className="fieldset">
              <legend>Projects (drag to reorder)</legend>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndProj}>
                <SortableContext
                  items={data.projects.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {(data.projects || []).map((p, idx) => (
                    <SortableCard id={p.id} key={p.id}>
                      <div className="card">
                        <div className="row two">
                          <label className="field">
                            <span className="label">Name</span>
                            <input
                              className="input"
                              value={p.name}
                              onChange={(e) => updateProject(idx, "name", e.target.value)}
                              placeholder="e.g., Service Desk & Fault Monitor"
                            />
                          </label>
                          <label className="field">
                            <span className="label">Link</span>
                            <input
                              className="input"
                              value={p.link}
                              onChange={(e) => updateProject(idx, "link", e.target.value)}
                              placeholder="https://..."
                            />
                          </label>
                        </div>

                        <label className="field">
                          <span className="label">Details</span>
                          <textarea
                            className="textarea"
                            rows={3}
                            value={p.details}
                            onChange={(e) => updateProject(idx, "details", e.target.value)}
                            placeholder="What it does, your role, stack, and quantifiable impact..."
                          />
                        </label>

                        <div className="row end" style={{ gap: 8 }}>
                          <button
                            type="button"
                            className="btn btn-ai"
                            onClick={() => improveProjectOne(idx)}
                            disabled={!!loadingAI.projectByIdx[idx]}
                            title="Improve only this project using AI"
                          >
                            {loadingAI.projectByIdx[idx] ? "Improving…" : "Improve this project"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-danger"
                            onClick={() => removeProject(idx)}
                          >
                            Remove project
                          </button>
                        </div>
                      </div>
                    </SortableCard>
                  ))}
                </SortableContext>
              </DndContext>

              <button type="button" className="btn btn-outline" onClick={addProject}>
                + Add project
              </button>

              <div className="ai-improve-wrap">
                <button className="btn btn-ai" onClick={improveProjects} disabled={loadingAI.projects}>
                  {loadingAI.projects ? "Improving..." : "Improve All Projects using AI"}
                </button>
              </div>
            </fieldset>

            {/* Education */}
            <fieldset className="fieldset">
              <legend>Education (multiple)</legend>
              {data.education.map((ed, idx) => (
                <div className="card" key={idx}>
                  <div className="row two">
                    <label className="field">
                      <span className="label">School</span>
                      <input
                        className="input"
                        value={ed.school}
                        onChange={(e) => updateEducation(idx, "school", e.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span className="label">Degree</span>
                      <input
                        className="input"
                        value={ed.degree}
                        onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                      />
                    </label>
                  </div>
                  <label className="field">
                    <span className="label">Period</span>
                    <input
                      className="input"
                      value={ed.period}
                      onChange={(e) => updateEducation(idx, "period", e.target.value)}
                      placeholder="e.g., 2016 – 2020"
                    />
                  </label>
                  <div className="row end">
                    <button
                      type="button"
                      className="btn btn-ghost btn-danger"
                      onClick={() => removeEducation(idx)}
                    >
                      Remove education
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-outline" onClick={addEducation}>
                + Add education
              </button>
            </fieldset>

            {/* Achievements + Improve all */}
            <fieldset className="fieldset">
              <legend>Achievements (multiple)</legend>
              {(data.achievements || []).map((a, idx) => (
                <div className="row bullet-row" key={idx}>
                  <input
                    className="input"
                    value={a}
                    onChange={(e) => updateAchievement(idx, e.target.value)}
                    placeholder="e.g., Won ‘Best Frontend’ at ..."
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-danger"
                    onClick={() => removeAchievement(idx)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-outline" onClick={addAchievement}>
                + Add achievement
              </button>

              <div className="ai-improve-wrap">
                <button
                  className="btn btn-ai"
                  onClick={improveAchievements}
                  disabled={loadingAI.achievements}
                >
                  {loadingAI.achievements ? "Improving…" : "Improve Achievements using AI"}
                </button>
              </div>
            </fieldset>

            <small className="hint">
              Tip: switch to a preview tab to see changes live and export as PDF/Word.
            </small>
          </div>
        )}

        {/* Preview actions */}
        {active !== "info" && (
          <div className="preview-header">
            <div className="actions">
              <button className="btn" onClick={handleDownloadPDF}>
                Download PDF
              </button>
              <button className="btn" onClick={handleDownloadDocx}>
                Download Word
              </button>
            </div>
          </div>
        )}

        {/* Previews */}
        {active === "classic" && <ClassicPreview id="preview-classic" data={data} />}
        {active === "modern" && <ModernPreview id="preview-modern" data={data} />}
        {active === "minimal" && <MinimalPreview id="preview-minimal" data={data} />}
      </div>
    </div>
  );
};

export default ResumeCreatePage;
