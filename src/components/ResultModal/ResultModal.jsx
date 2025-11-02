import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import "./ResultModal.scss";

const extractExplanation = (raw) => {
  if (!raw) return "";
  // If provider already returns an object
  if (typeof raw === "object") {
    if (raw?.questions?.[0]?.explanation) return raw.questions[0].explanation;
    if (raw?.explanation) return raw.explanation;
    return JSON.stringify(raw, null, 2); // fallback
  }
  // If provider returns a string (JSON or plain)
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.questions?.[0]?.explanation) return parsed.questions[0].explanation;
    if (parsed?.explanation) return parsed.explanation;
    return raw;
  } catch {
    // not JSON, return as-is
    return raw;
  }
};

const ResultModal = ({ correct, total, onClose, title, bodyProvider }) => {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(!!bodyProvider);
  const [error, setError] = useState("");
  const backdropRef = useRef(null);

  // Fetch explanation if provided
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!bodyProvider) return;
      try {
        setLoading(true);
        setError("");
        const text = await bodyProvider();
        if (!mounted) return;

        const explanation = extractExplanation(text);
        setBody(explanation || "");
      } catch (e) {
        if (mounted) setError("Could not load the explanation. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [bodyProvider]);

  // Close on ESC and lock body scroll
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose?.();
  };

  const content = (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      onMouseDown={handleBackdropClick}
    >
      <div className="modal" role="document" aria-live="polite">
        <div className="modal-head">
          <h3>{title ?? "Your Score"}</h3>
          <button className="icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {typeof correct === "number" && typeof total === "number" ? (
            <p><strong>{correct}</strong> / {total} correct</p>
          ) : bodyProvider ? (
            loading ? (
              <div className="explanation loading">
                <div className="skeleton line" />
                <div className="skeleton line" />
                <div className="skeleton line short" />
              </div>
            ) : error ? (
              <p className="error">{error}</p>
            ) : body ? (
              <div className="explanation">{body}</div>
            ) : (
              <p className="muted">No explanation available.</p>
            )
          ) : null}
        </div>

        <div className="modal-foot">
          <button className="primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  // render to body so it centers in viewport regardless of transformed ancestors
  return createPortal(content, document.body);
};

export default ResultModal;
