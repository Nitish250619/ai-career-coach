import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Loader.scss';

const DEFAULT_TIPS = [
  "We use route-level code splitting with React.lazy to cut initial bundle size.",
  "Critical assets are preloaded; the rest are prefetched after first paint.",
  "Long lists are virtualized to keep scrolling at 60fps.",
  "Expensive computations are memoized with useMemo & useCallback.",
  "Images are lazy-loaded with native loading='lazy' and responsive srcsets.",
  "Requests are debounced/throttled to reduce network chatter.",
  "Skeletons + Suspense keep transitions snappy and avoid layout shift.",
  "CDN caching + immutable file hashing accelerate repeat visits."
];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/**
 * Props:
 * - message: string (top headline)
 * - tips: string[] (custom tips)
 * - typingSpeed: ms per character while typing
 * - minReadMs / maxReadMs: bounds for how long each tip stays fully typed
 * - perCharReadMs: extra read time per char to auto-scale dwell time
 * - loop: whether to loop the tips
 * - ariaLabel: custom aria-label for screen readers
 */
const Loader = ({
  message = 'Generating your quiz…',
  tips = DEFAULT_TIPS,
  typingSpeed = 25,
  perCharReadMs = 40,
  minReadMs = 1400,
  maxReadMs = 4200,
  loop = true,
  ariaLabel = 'Loading, please wait'
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState('typing'); // 'typing' | 'reading' | 'erasing'
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  const currentTip = tips[tipIndex] || '';
  const totalChars = currentTip.length;

  // Respect user’s reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Core state machine for typing → reading → erasing → next
  useEffect(() => {
    if (paused) return;

    const clearTimers = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    const typeNext = () => {
      if (reducedMotion) {
        setDisplayed(currentTip);
        setPhase('reading');
        return;
      }
      if (displayed.length < totalChars) {
        timerRef.current = setTimeout(() => {
          setDisplayed(prev => prev + currentTip.charAt(prev.length));
        }, typingSpeed);
      } else {
        setPhase('reading');
      }
    };

    const dwell = () => {
      const dwellTime = clamp(
        minReadMs + totalChars * perCharReadMs,
        minReadMs,
        maxReadMs
      );
      timerRef.current = setTimeout(() => {
        setPhase('erasing');
      }, reducedMotion ? minReadMs : dwellTime);
    };

    const erasePrev = () => {
      if (reducedMotion) {
        // Skip erase animation for reduced motion
        setDisplayed('');
        goNext();
        return;
      }
      if (displayed.length > 0) {
        timerRef.current = setTimeout(() => {
          setDisplayed(prev => prev.slice(0, -Math.max(1, Math.ceil(totalChars * 0.08))));
        }, Math.max(typingSpeed * 0.75, 18));
      } else {
        goNext();
      }
    };

    const goNext = () => {
      const next = tipIndex + 1;
      if (next < tips.length) {
        setTipIndex(next);
        setPhase('typing');
      } else if (loop) {
        setTipIndex(0);
        setPhase('typing');
      } else {
        // If not looping, just stay on last fully shown tip
        setPhase('reading');
        setDisplayed(currentTip);
      }
    };

    clearTimers();
    if (phase === 'typing') typeNext();
    if (phase === 'reading') dwell();
    if (phase === 'erasing') erasePrev();

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, displayed, paused, tipIndex, typingSpeed, reducedMotion, tips]);

  // Kick typing when tipIndex changes
  useEffect(() => {
    setDisplayed('');
    setPhase('typing');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipIndex]);

  // Progress (for the underline bar) only during 'reading'
  const readingProgress = useMemo(() => {
    if (phase !== 'reading') return 0;
    const dwellTime = clamp(
      minReadMs + totalChars * perCharReadMs,
      minReadMs,
      maxReadMs
    );
    return dwellTime; // we’ll use CSS animation duration
  }, [phase, totalChars, minReadMs, maxReadMs, perCharReadMs]);

  // Accessibility: allow keyboard pause/resume (Space/Enter)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        setPaused(p => !p);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        // Skip to next tip
        setPhase('erasing');
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        // Go back a tip
        setTipIndex(i => (i === 0 ? tips.length - 1 : i - 1));
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tips.length]);

  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);

  return (
    <div
      className="loader-container"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`spinner ${paused ? 'is-paused' : ''}`} />

      <p className="loader-message">{message}</p>

      <div className="tip-wrap">
        <span className="tip-prefix" aria-hidden="true">Pro tip:</span>
        <span className="tip-text">
          {displayed}
          {!reducedMotion && <span className={`caret ${phase === 'reading' ? 'dim' : ''}`} aria-hidden="true">|</span>}
        </span>

        {/* Per-tip progress underline during reading */}
        <span
          className={`tip-progress ${phase === 'reading' ? 'active' : ''}`}
          style={
            phase === 'reading'
              ? { animationDuration: `${Math.max(300, readingProgress)}ms` }
              : undefined
          }
          aria-hidden="true"
        />
      </div>

      <div className="tip-controls">
        <button
          type="button"
          className="loader-btn"
          onClick={() => setPaused(p => !p)}
          aria-pressed={paused}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          type="button"
          className="loader-btn"
          onClick={() => setPhase('erasing')}
        >
          Next tip
        </button>
      </div>

      {/* Tip dots */}
      <div className="tip-dots" aria-label="Tips progress">
        {tips.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === tipIndex ? 'active' : ''}`}
            aria-hidden={i !== tipIndex ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Screen-reader only: announce tip index */}
      <span className="sr-only">
        {`Tip ${tipIndex + 1} of ${tips.length}`}
      </span>
    </div>
  );
};

export default Loader;
