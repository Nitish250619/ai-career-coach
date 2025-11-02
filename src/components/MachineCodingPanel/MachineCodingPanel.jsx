import React from 'react';
import "./MachineCodingPanel.scss"

const MachineCodingPanel = ({ prompts, status }) => {
  return (
    <section className="machine-panel">
      <div className="row">
        <h2>Machine Coding Scenarios</h2>
        <div className="grow" />
        <span className={`badge ${status}`}>{status}</span>
      </div>

      {!prompts.length && (
        <div className="empty">Click <em>Generate</em> to create machine coding questions.</div>
      )}

      <ul className="mc-list">
        {prompts.map((p, idx) => (
          <li key={idx} className="mc-item">
            <h3>{p.title}</h3>
            <p className="desc" dangerouslySetInnerHTML={{ __html: p.statement }} />
            <details>
              <summary>Accept Criteria</summary>
              <ul>
                {p.acceptance?.map((a, i) => <li key={i} dangerouslySetInnerHTML={{ __html: a }} />)}
              </ul>
            </details>
            <details>
              <summary>Hints</summary>
              <ul>
                {p.hints?.map((h, i) => <li key={i} dangerouslySetInnerHTML={{ __html: h }} />)}
              </ul>
            </details>
            {p.starter && (
              <details>
                <summary>Starter Code (React)</summary>
                <pre><code>{p.starter}</code></pre>
              </details>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MachineCodingPanel;