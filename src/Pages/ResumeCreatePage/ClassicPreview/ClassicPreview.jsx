import React from "react";
import "./ClassicPreview.scss";

const ClassicPreview = ({ id = "preview-classic", data }) => {
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
    <div id={id} className="resume classic-v2">
      <header className="cl-header">
        <div className="cl-id">
          <h1 className="cl-name">{name}</h1>
          <div className="cl-role">{title}</div>
        </div>
        <div className="cl-contact">
          {[contact.email, contact.phone, contact.location, contact.website, contact.linkedin, contact.github]
            .filter(Boolean)
            .map((v, i, arr) => (
              <span key={i} className="cl-contact-item">
                {v}
                {i !== arr.length - 1 && <span className="cl-dot">•</span>}
              </span>
            ))}
        </div>
      </header>

      <div className="cl-grid">
        {/* LEFT COLUMN */}
        <main className="cl-main">
          {summary && (
            <section className="cl-sec">
              <h2 className="cl-h2">Profile</h2>
              <p className="cl-text">{summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section className="cl-sec">
              <h2 className="cl-h2">Experience</h2>
              <div className="cl-timeline">
                {experience.map((exp, i) => (
                  <article key={i} className="cl-job">
                    <div className="cl-job-head">
                      <div className="cl-job-title">
                        <strong>{exp.role}</strong>
                        <span className="cl-company"> · {exp.company}</span>
                      </div>
                      <div className="cl-period">{exp.period}</div>
                    </div>
                    {exp.bullets?.length > 0 && (
                      <ul className="cl-list">
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
            <section className="cl-sec">
              <h2 className="cl-h2">Projects</h2>
              {projects.map((p, i) => (
                <article key={i} className="cl-project">
                  <div className="cl-project-head">
                    <strong className="cl-project-name">{p.name}</strong>
                    {p.link && (
                      <a className="cl-link" href={p.link} target="_blank" rel="noreferrer">
                        {p.link}
                      </a>
                    )}
                  </div>
                  <p className="cl-text">{p.details}</p>
                </article>
              ))}
            </section>
          )}
        </main>

        {/* RIGHT COLUMN */}
        <aside className="cl-side">
          {skills.length > 0 && (
            <section className="cl-sec">
              <h3 className="cl-h3">Skills</h3>
              <ul className="cl-tags">
                {skills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>
          )}

          {achievements.length > 0 && (
            <section className="cl-sec">
              <h3 className="cl-h3">Achievements</h3>
              <ul className="cl-bullets">
                {achievements.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </section>
          )}

          {education.length > 0 && (
            <section className="cl-sec">
              <h3 className="cl-h3">Education</h3>
              <ul className="cl-edu">
                {education.map((e, i) => (
                  <li key={i} className="cl-edu-row">
                    <div className="cl-edu-top">
                      <strong className="cl-school">{e.school}</strong>
                      <span className="cl-edu-period">{e.period}</span>
                    </div>
                    <div className="cl-degree">{e.degree}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ClassicPreview;
