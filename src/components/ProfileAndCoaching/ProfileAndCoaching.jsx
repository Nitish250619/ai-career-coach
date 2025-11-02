import React, { useEffect, useRef, useState } from "react";
import { UserButton } from "@clerk/react-router";
import { useNavigate, useLocation } from "react-router-dom";
import "./ProfileAndCoaching.scss";

const options = [
  { label: "Resume Builder", value: "/resume-builder" },
  { label: "Cover Letter Creator", value: "/cover-letter" },
  { label: "Preparation", value: "/preparation" },
];

const PATH_TO_LABEL = Object.fromEntries(options.map(o => [o.value, o.label]));
const PLACEHOLDER = "Begin Your Career Journey";

const ProfileAndCoaching = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(PLACEHOLDER);

  const rootRef = useRef(null);
  const btnRef = useRef(null);

  // Initialize/sync label from current URL (useful on refresh or deep link)
  useEffect(() => {
    setSelectedLabel(PATH_TO_LABEL[location.pathname] ?? PLACEHOLDER);
  }, [location.pathname]);

  // Close on click outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Keyboard support
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      btnRef.current?.focus();
    }
    if ((e.key === "Enter" || e.key === " ") && e.target === btnRef.current) {
      e.preventDefault();
      setOpen(o => !o);
    }
    if ((e.key === "ArrowDown" || e.key === "Down") && open) {
      e.preventDefault();
      const first = rootRef.current?.querySelector(".dropdownMenu li");
      first?.focus();
    }
  };

  const onOptionClick = (value, label) => {
    setSelectedLabel(label);   // <-- update trigger text
    setOpen(false);
    navigate(value);
    requestAnimationFrame(() => btnRef.current?.focus());
  };

  return (
    <div
      ref={rootRef}
      className={`profileAndCoachingContainer ${open ? "is-open" : ""}`}
      onKeyDown={handleKeyDown}
    >
      <UserButton />

      <button
        ref={btnRef}
        type="button"
        className="selectTrigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {selectedLabel}
        <span className="chev" aria-hidden>▾</span>
      </button>

      <ul className="dropdownMenu" role="listbox" aria-label="Career actions" tabIndex={-1}>
        {options.map((opt) => (
          <li
            key={opt.value}
            role="option"
            aria-selected={selectedLabel === opt.label}
            tabIndex={0}
            onClick={() => onOptionClick(opt.value, opt.label)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOptionClick(opt.value, opt.label);
              }
            }}
          >
            {opt.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileAndCoaching;
