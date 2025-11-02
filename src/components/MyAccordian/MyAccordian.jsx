import React, { useEffect, useRef, useState } from "react";
import "./MyAccordian.scss";

const QA = [
  {
    q: "How do I prepare a strong cover letter with AI?",
    a: `Start with a sharp opener that states the role and a one-line value prop.
Use AI to mirror the company’s tone, pull keywords from the JD, and map your
most relevant project to the job. Close with a confident call-to-action.`,
    bullets: [
      "Hook: role, why you, 1-line impact",
      "JD → keywords → align skills & results",
      "1–2 concise stories (STAR: Situation→Task→Action→Result)",
      "Tone match (formal / friendly) + clear CTA",
    ],
  },
  {
    q: "What should my resume highlight to pass ATS?",
    a: `Quantify impact and keep structure ATS-readable. Use consistent section
headings (Summary, Skills, Experience, Projects).`,
    bullets: [
      "Action verbs + metrics (↑conversion, ↓latency, ₹ savings)",
      "Plain text layout, no tables/columns for ATS",
      "Role-matched keywords from JD woven naturally",
      "Project outcomes, not just responsibilities",
    ],
  },
  {
    q: "How can AI help me prepare for frontend interviews?",
    a: `Use targeted quizzes, machine-coding prompts, and talk through trade-offs.
Practice React patterns, performance, and browser internals.`,
    bullets: [
      "Timed quizzes: JS, React, Browser APIs",
      "Machine-coding: specs, edge cases, tests",
      "System design: caching, pagination, SSR",
      "Behavioral: STAR stories tailored to role",
    ],
  },
  {
    q: "Tips for tailoring a cover letter to a specific JD?",
    a: `Identify 3 JD must-haves and echo them in your achievements. Keep it under
300 words and end with availability.`,
    bullets: [
      "Pick 3 must-haves → map 3 proof points",
      "Mirror keywords & tone (AI assist)",
      "Keep 220–300 words, crisp paragraphs",
      "Polite, proactive closing line",
    ],
  },
  {
    q: "How can AI optimize my LinkedIn profile?",
    a: `Leverage AI to rewrite your headline, about section, and experiences using
impact verbs and keywords. Maintain authenticity but aim for clarity and discoverability.`,
    bullets: [
      "Headline: role + key impact + niche",
      "About: 3 short paragraphs (who, what, why)",
      "Use JD keyword extraction tools for SEO",
      "Add featured projects and quantifiable results",
    ],
  },
  {
    q: "How do I use AI for mock interviews?",
    a: `Simulate real interviews using AI question generators. Record and analyze 
your tone, clarity, and structure to improve communication.`,
    bullets: [
      "Choose domain: frontend / backend / behavioral",
      "Enable camera & mic for real simulation",
      "Get AI feedback: filler words, clarity, confidence",
      "Iterate until answers are concise & confident",
    ],
  },
  {
    q: "How can I stand out in remote job applications?",
    a: `Use AI to tailor outreach messages, emphasize self-management, async communication,
and productivity tools experience.`,
    bullets: [
      "Customize intro: company name + genuine reason",
      "Highlight async tools: Slack, Notion, Trello",
      "Show timezone flexibility & accountability",
      "Include links to portfolio / code samples",
    ],
  },
];


function AccordionItem({ item, i, allowMultiple, onToggle, openIndex }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // If single-open mode, sync open state from parent
  useEffect(() => {
    if (!allowMultiple) setOpen(openIndex === i);
  }, [allowMultiple, openIndex, i]);

  // Auto-height transition using inline maxHeight
  const maxH = open ? `${panelRef.current?.scrollHeight || 0}px` : "0px";

  const toggle = () => {
    if (allowMultiple) setOpen((v) => !v);
    else onToggle(i);
  };

  return (
    <div className={`accItem ${open ? "is-open" : ""}`} style={{ "--delay": `${i * 60}ms` }}>
      <button
        className="accItem__head"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={`acc-panel-${i}`}
      >
        <span className="accItem__icon" aria-hidden>✉️</span>
        <span className="accItem__q">{item.q}</span>
        <svg className="accItem__chev" viewBox="0 0 24 24" aria-hidden>
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div
        id={`acc-panel-${i}`}
        className="accItem__panel"
        ref={panelRef}
        style={{ maxHeight: maxH }}
        role="region"
        aria-label={item.q}
      >
        <div className="accItem__inner">
          <p className="accItem__a">{item.a}</p>
          {item.bullets?.length > 0 && (
            <ul className="accItem__list">
              {item.bullets.map((b, bi) => (
                <li key={bi} style={{ "--i": bi }}>✓ {b}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyAccordian({
  items = QA,
  allowMultiple = false, // set true if you want many open at once
}) {
  const [openIndex, setOpenIndex] = useState(-1);
  const onToggle = (i) => setOpenIndex((cur) => (cur === i ? -1 : i));

  return (
    <section className="accordion" aria-labelledby="acc-title">
      <header className="accordion__header">
        <h2 id="acc-title" className="accordion__title">
          Cover Letters, Resumes & Frontend Prep — Answered
        </h2>
        <p className="accordion__subtitle">
          Click a question to reveal AI-backed tips, with smooth animations and crisp structure.
        </p>
      </header>

      <div className="accordion__wrap">
        {items.map((item, i) => (
          <AccordionItem
            key={i}
            i={i}
            item={item}
            allowMultiple={allowMultiple}
            onToggle={onToggle}
            openIndex={openIndex}
          />
        ))}
      </div>
    </section>
  );
}
