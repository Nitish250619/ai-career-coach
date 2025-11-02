import React from "react";
import { NavLink } from "react-router-dom";
import "./MyFooter.scss";

const NAV = [
  {
    head: "Product",
    links: [
      { label: "Resume Builder", to: "/resume-builder" },
      { label: "Cover Letter", to: "/cover-letter" },
      { label: "Frontend Prep", to: "/preparation" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    head: "Resources",
    links: [
      { label: "Guides & Playbooks", to: "/guides" },
      { label: "Interview Q&A", to: "/interview" },
      { label: "Changelogs", to: "/changelog" },
      { label: "Status", to: "/status" },
    ],
  },
  {
    head: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
      { label: "Privacy & Terms", to: "/legal" },
    ],
  },
];

const year = new Date().getFullYear();

const SocialIcon = ({ type }) => {
  if (type === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.9 3H22l-9.5 11.2L21.6 21H15l-6-7.1L3.4 21H2l8.4-9.9L2.7 3H9l5.2 6.2L18.9 3z" fill="currentColor"/>
      </svg>
    );
  }
  if (type === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.07 3.29 9.36 7.86 10.87.58.1.79-.25.79-.56v-2.02c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.3-1.68-1.3-1.68-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.11-.77.41-1.27.74-1.56-2.56-.29-5.25-1.28-5.25-5.67 0-1.25.45-2.27 1.2-3.06-.12-.29-.52-1.45.11-3.02 0 0 .98-.31 3.21 1.17a11.2 11.2 0 0 1 5.84 0c2.23-1.48 3.21-1.17 3.21-1.17.63 1.57.23 2.73.11 3.02.75.79 1.2 1.81 1.2 3.06 0 4.41-2.7 5.38-5.28 5.66.42.36.8 1.07.8 2.16v3.2c0 .31.21.67.79.56A11.51 11.51 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" fill="currentColor"/>
      </svg>
    );
  }
  // linkedin
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zM8 8h3.8v2.2h.05C12.6 8.7 14.2 8 16.1 8 20.4 8 24 10.9 24 16.1V24h-4v-6.6c0-1.6-.03-3.7-2.3-3.7-2.3 0-2.6 1.8-2.6 3.6V24h-4V8z" fill="currentColor"/>
    </svg>
  );
};

const MyFooter = () => {
  const scrollTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="ftr" aria-labelledby="footer-title">
      {/* decorative layers */}
      <div className="ftr__glow" aria-hidden />
      <div className="ftr__orbs" aria-hidden>
        <span /><span /><span />
      </div>

      <div className="ftr__inner">
        <div className="ftr__brand" data-in>
          <div className="ftr__logo" aria-hidden>⚡</div>
          <h2 id="footer-title" className="ftr__title">AI Career Coach</h2>
          <p className="ftr__tag">
            Build standout resumes, tailor cover letters, and prep for frontend interviews —
            faster, sharper, smarter.
          </p>

          <div className="ftr__social" aria-label="social links">
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X (Twitter)"><SocialIcon type="x" /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><SocialIcon type="github" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><SocialIcon /></a>
          </div>
        </div>

        <nav className="ftr__nav" aria-label="footer navigation">
          {NAV.map((col, idx) => (
            <div className="ftr__col" key={col.head} data-in style={{ "--i": idx }}>
              <h3 className="ftr__head">{col.head}</h3>
              <ul className="ftr__links">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <NavLink
                      to={l.to}
                      className={({ isActive }) =>
                        `ftr__link ${isActive ? "is-active" : ""}`
                      }
                      end
                    >
                      <span className="ftr__linkText">{l.label}</span>
                      <span className="ftr__hoverLine" aria-hidden />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="ftr__bottom">
        <p>© {year} AI Career Coach. All rights reserved.</p>
        <div className="ftr__legal">
          <NavLink to="/legal">Terms</NavLink>
          <NavLink to="/privacy">Privacy</NavLink>
          <button className="ftr__top" onClick={scrollTop} aria-label="Back to top">↑</button>
        </div>
      </div>
    </footer>
  );
};

export default MyFooter;
