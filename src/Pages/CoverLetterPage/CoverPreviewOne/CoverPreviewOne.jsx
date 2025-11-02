import React from "react";
import "./CoverPreviewOne.scss";

/**
 * Clean, left-aligned letterhead + classic block letter format
 */
const CoverPreviewOne = ({ id = "preview-t1", data }) => {
  const a = data?.applicant || {};
  const j = data?.job || {};
  const paras = data?.paragraphs || [];

  return (
    <div id={id} className="cover-preview cover-one">
      <header className="cp-header">
        <h2 className="name">{a.name}</h2>
        <div className="meta">
          <span>{a.title}</span>
          <span>•</span>
          <span>{a.location}</span>
          <span>•</span>
          <span>{a.email}</span>
          <span>•</span>
          <span>{a.phone}</span>
          {a.linkedin ? (<><span>•</span><span>{a.linkedin}</span></>) : null}
          {a.website ? (<><span>•</span><span>{a.website}</span></>) : null}
        </div>
      </header>

      <section className="cp-body">
        <div className="cp-date">{j.today}</div>
        <div className="cp-recipient">
          {j.recipientName && <div>{j.recipientName}{j.recipientTitle ? `, ${j.recipientTitle}` : ""}</div>}
          {j.companyLocation && <div>{j.companyLocation}</div>}
          {j.company && <div>{j.company}</div>}
          {j.recipientEmail && <div>{j.recipientEmail}</div>}
        </div>

        <p>Dear {j.recipientName || "Hiring Manager"},</p>

        <p>{data.intro}</p>

        {paras.map((p, i) => (
          <p key={p.id || i}>{p.text}</p>
        ))}

        <p>{data.closing}</p>

        <div className="cp-signoff">
          <div>{data.signOff || "Sincerely"},{/* comma style */}</div>
          <div className="cp-name">{a.name}</div>
        </div>

        {j.jobLink ? (
          <div className="cp-footer-note">
            Applying for: <strong>{j.role || "Frontend Engineer"}</strong> @ {j.company || ""}
            {j.jobId ? <> — Job ID: {j.jobId}</> : null}
            {" · "}
            <span className="cp-link">{j.jobLink}</span>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default CoverPreviewOne;
