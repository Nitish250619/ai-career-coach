import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./TemplatePreview.scss";

const RESUME_TEMPLATES = [
  { id: "r-classic", name: "Classic ATS", kind: "resume", src: "https://images.unsplash.com/photo-1524638431109-93d95c968f03?q=80&w=1200&auto=format&fit=crop" },
  { id: "r-modern",  name: "Modern Edge", kind: "resume", src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop" },
  { id: "r-compact", name: "Compact One-Pager", kind: "resume", src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop" },
];

const COVER_TEMPLATES = [
  { id: "c-concise",   name: "Concise",    kind: "cover", src: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop" },
  { id: "c-warm",      name: "Warm",       kind: "cover", src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop" },
  { id: "c-technical", name: "Technical",  kind: "cover", src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop" },
];

const ALL = [...RESUME_TEMPLATES, ...COVER_TEMPLATES];

const Section = ({ title, items, onOpen }) => (
  <section className="tplSimple__section">
    <h3 className="tplSimple__heading">{title}</h3>
    <ul className="tplSimple__grid">
      {items.map((t) => (
        <li key={t.id} className="tplSimple__card">
          <figure className="tplSimple__figure">
            <button
              className="tplSimple__imgBtn"
              onClick={() => onOpen(t.id)}
              aria-label={`Open preview of ${t.name}`}
            >
              <img
                className="tplSimple__img"
                src={t.src}
                alt={`${t.name} template preview`}
                loading="lazy"
                decoding="async"
              />
              <span className="tplSimple__zoom" aria-hidden>🔍</span>
            </button>
            <figcaption className="tplSimple__caption">{t.name}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  </section>
);

export default function TemplatePreview() {
  const [activeId, setActiveId] = useState(null);

  const activeIndex = useMemo(
    () => ALL.findIndex((t) => t.id === activeId),
    [activeId]
  );
  const activeItem = activeIndex >= 0 ? ALL[activeIndex] : null;

  const close = useCallback(() => setActiveId(null), []);
  const next = useCallback(() => {
    if (activeIndex < 0) return;
    const i = (activeIndex + 1) % ALL.length;
    setActiveId(ALL[i].id);
  }, [activeIndex]);
  const prev = useCallback(() => {
    if (activeIndex < 0) return;
    const i = (activeIndex - 1 + ALL.length) % ALL.length;
    setActiveId(ALL[i].id);
  }, [activeIndex]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (activeItem) {
      const { overflow } = document.body.style;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = overflow; };
    }
  }, [activeItem]);

  // Keyboard controls
  useEffect(() => {
    if (!activeItem) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeItem, close, next, prev]);

  return (
    <div className="tplSimple">
      <h2 className="tplSimple__title">Templates</h2>
      <p className="tplSimple__sub">Predefined previews for resumes & cover letters</p>

      <Section title="Resume Templates" items={RESUME_TEMPLATES} onOpen={setActiveId} />
      <Section title="Cover Letter Templates" items={COVER_TEMPLATES} onOpen={setActiveId} />

      {/* Modal */}
      {activeItem && (
  <div className="tplSimpleModal" role="dialog" aria-modal="true" onClick={close}>
    <div className="tplSimpleModal__panel" onClick={(e) => e.stopPropagation()}>
      <header className="tplSimpleModal__head">...</header>

      {/* Scrollable body */}
      <div className="tplSimpleModal__body">
        <img
          className="tplSimpleModal__img"
          src={activeItem.src}
          alt={`${activeItem.name} full preview`}
          loading="eager"
        />
      </div>

      <footer className="tplSimpleModal__foot">
        <button className="tplNavBtn" onClick={prev}>← Prev</button>
        <button className="tplNavBtn" onClick={next}>Next →</button>
      </footer>
    </div>
  </div>
)}

    </div>
  );
}
