import React from "react";
import "./CoverPreviewTwo.scss";

/**
 * Sidebar letterhead with bold role emphasis
 */
const CoverPreviewTwo = ({ id = "preview-t2", data }) => {
  const a = data?.applicant || {};
  const j = data?.job || {};
  const paras = data?.paragraphs || [];

  return (
    <div id={id} className="cover-preview cover-two">
      <aside className="cp-side">
        <div className="cp-avatar">{(a.name || "A")[0]}</div>
        <h3 className="cp-name">{a.name}</h3>
        <div className="cp-title">{a.title}</div>
        <ul className="cp-contact">
          <li>{a.email}</li>
          <li>{a.phone}</li>
          <li>{a.location}</li>
          {a.linkedin ? <li>{a.linkedin}</li> : null}
          {a.website ? <li>{a.website}</li> : null}
        </ul>
      </aside>

      <main className="cp-main">
        <div className="cp-job">
          <div className="cp-role">{j.role || "Frontend Engineer"}</div>
          <div className="cp-company">{j.company}{j.companyLocation ? ` • ${j.companyLocation}` : ""}</div>
          <div className="cp-date">{j.today}</div>
        </div>

        <p className="cp-greeting">Dear {j.recipientName || "Hiring Manager"},</p>
        <p>{data.intro}</p>
        {paras.map((p) => (
          <p key={p.id}>{p.text}</p>
        ))}
        <p>{data.closing}</p>

        <div className="cp-signoff">
          <div>{data.signOff || "Sincerely"},</div>
          <div className="cp-name-strong">{a.name}</div>
        </div>

        {j.jobLink ? (
          <div className="cp-applied">
            <span>Applied via:</span> <span className="cp-link">{j.jobLink}</span>
            {j.jobId ? <span className="cp-jobid"> • Job ID: {j.jobId}</span> : null}
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default CoverPreviewTwo;
