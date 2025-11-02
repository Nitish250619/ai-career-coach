import React from "react";
import "./MinimalPreview.scss";

const MinimalPreview = ({ id = "preview-minimal", data }) => {
  const {
    name,
    title,
    contact = {},
    summary,
    skills = [],
    experience = [],
    education = [],
    projects = [],
    achievements = [],
  } = data || {};

  return (
    <div id={id} className="resume minimal-onecol">
      <header className="mi-header">
        <h1 className="mi-name">{name}</h1>
        <div className="mi-role">{title}</div>
        <div className="mi-contact">
          {[
            contact.email,
            contact.phone,
            contact.location,
            contact.website,
            contact.linkedin,
            contact.github,
          ]
            .filter(Boolean)
            .map((v, i, arr) => (
              <span key={i} className="mi-contact-item">
                {v}
                {i !== arr.length - 1 && <span className="mi-dot">•</span>}
              </span>
            ))}
        </div>
      </header>

      <main className="mi-main">
        {summary && (
          <section className="mi-sec">
            <h2 className="mi-h2">Professional Summary</h2>
            <p className="mi-text">{summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="mi-sec">
            <h2 className="mi-h2">Experience</h2>
            {experience.map((e, i) => (
              <div key={i} className="mi-block">
                <div className="mi-head">
                  <strong>{e.role}</strong>
                  <span className="mi-muted">{e.period}</span>
                </div>
                <div className="mi-sub">{e.company}</div>
                <ul className="mi-ul">
                  {e.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {projects.length > 0 && (
          <section className="mi-sec">
            <h2 className="mi-h2">Projects</h2>
            {projects.map((p, i) => (
              <div key={i} className="mi-block">
                <div className="mi-head">
                  <strong>{p.name}</strong>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" className="mi-muted mi-link">
                      {p.link}
                    </a>
                  )}
                </div>
                <p className="mi-text">{p.details}</p>
              </div>
            ))}
          </section>
        )}

        {skills.length > 0 && (
          <section className="mi-sec">
            <h2 className="mi-h2">Skills</h2>
            <ul className="mi-tags">
              {skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>
        )}

        {education.length > 0 && (
          <section className="mi-sec">
            <h2 className="mi-h2">Education</h2>
            {education.map((ed, i) => (
              <div key={i} className="mi-block">
                <div className="mi-head">
                  <strong>{ed.school}</strong>
                  <span className="mi-muted">{ed.period}</span>
                </div>
                <div className="mi-sub">{ed.degree}</div>
              </div>
            ))}
          </section>
        )}

        {achievements.length > 0 && (
          <section className="mi-sec">
            <h2 className="mi-h2">Achievements</h2>
            <ul className="mi-list">
              {achievements.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
};

export default MinimalPreview;
