import React from "react";
import "./ModernPreview.scss";

const ModernPreview = ({ id = "preview-modern", data }) => {
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
    <div id={id} className="resume modern-v2">
      <aside className="md-side">
        <div className="md-ident">
          <div className="md-name">{name}</div>
          <div className="md-role">{title}</div>
        </div>

        <div className="md-block">
          <h3 className="md-h3">Contact</h3>
          <ul className="md-list">
            {[
              contact.email,
              contact.phone,
              contact.location,
              contact.website,
              contact.linkedin,
              contact.github,
            ]
              .filter(Boolean)
              .map((v, i) => (
                <li key={i}>{v}</li>
              ))}
          </ul>
        </div>

        {skills.length > 0 && (
          <div className="md-block">
            <h3 className="md-h3">Skills</h3>
            <ul className="md-chips">
              {skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {achievements.length > 0 && (
          <div className="md-block">
            <h3 className="md-h3">Achievements</h3>
            <ul className="md-list">
              {achievements.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <main className="md-content">
        {summary && (
          <section className="md-sec">
            <h2 className="md-h2">About</h2>
            <p className="md-text">{summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="md-sec">
            <h2 className="md-h2">Experience</h2>
            <div className="md-timeline">
              {experience.map((exp, i) => (
                <article className="md-card" key={i}>
                  <div className="md-card-head">
                    <div className="md-card-title">
                      <strong>{exp.role}</strong> <span className="md-company">· {exp.company}</span>
                    </div>
                    <div className="md-muted">{exp.period}</div>
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className="md-ul">
                      {exp.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="md-sec">
            <h2 className="md-h2">Projects</h2>
            {projects.map((p, i) => (
              <article className="md-card" key={i}>
                <div className="md-card-head">
                  <div className="md-card-title">
                    <strong>{p.name}</strong>
                  </div>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" className="md-muted md-link">
                      {p.link}
                    </a>
                  )}
                </div>
                <p className="md-text">{p.details}</p>
              </article>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section className="md-sec">
            <h2 className="md-h2">Education</h2>
            <div className="md-edu">
              {education.map((e, i) => (
                <div className="md-edu-row" key={i}>
                  <strong>{e.school}</strong>
                  <span className="md-muted">
                    {e.degree} · {e.period}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ModernPreview;
