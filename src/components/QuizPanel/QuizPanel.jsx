import React, { useMemo, useState } from 'react';
import "./QuizPanel.scss"
import ResultModal from '../ResultModal/ResultModal';

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const QuizPanel = ({ questions, explain, status }) => {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(null);

  const prepared = useMemo(() => {
    return questions.map((q, idx) => ({
      ...q,
      idx,
      options: shuffle(q.options ?? []),
    }));
  }, [questions]);

  const correctCount = useMemo(() => {
    return prepared.reduce((acc, q) => acc + ((answers[q.idx] ?? '') === q.answer ? 1 : 0), 0);
  }, [answers, prepared]);

  return (
    <section className="quiz-panel">
      <div className="meta">
        <div className="stat"><strong>{prepared.length}</strong><span>Questions</span></div>
        <div className="stat"><strong>{correctCount}</strong><span>Correct</span></div>
        <div className="stat"><strong>{prepared.length - correctCount}</strong><span>Wrong</span></div>
        <div className="grow" />
        <button className="primary" disabled={!prepared.length || status === 'loading'} onClick={() => setShowResult(true)}>Submit</button>
      </div>

      {!prepared.length && (
        <div className="empty">No questions yet. Click <em>Generate</em> above.</div>
      )}

      <ol className="q-list">
        {prepared.map((q) => (
          <li key={q.idx} className={`q ${answers[q.idx] && (answers[q.idx] === q.answer ? 'right' : 'wrong')}`}>
            <div className="q-head">
              <span className="q-no">Q{q.idx + 1}</span>
              <h3 dangerouslySetInnerHTML={{ __html: q.prompt }} />
            </div>
            <div className="options">
              {q.options.map((opt) => (
                <label key={opt} className={`opt ${answers[q.idx] === opt ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name={`q-${q.idx}`}
                    value={opt}
                    checked={answers[q.idx] === opt}
                    onChange={() => setAnswers((s) => ({ ...s, [q.idx]: opt }))}
                  />
                  <span dangerouslySetInnerHTML={{ __html: opt }} />
                </label>
              ))}
            </div>
            <div className="q-actions">
              <button onClick={async () => setReviewIdx(q.idx)} className="ghost">Explain</button>
            </div>
          </li>
        ))}
      </ol>

      {showResult && (
        <ResultModal
          correct={correctCount}
          total={prepared.length}
          onClose={() => setShowResult(false)}
        />)
      }

      {reviewIdx !== null && (
        <ResultModal
          title={`Explanation for Q${reviewIdx + 1}`}
          bodyProvider={async () => await explain(questions[reviewIdx])}
          onClose={() => setReviewIdx(null)}
        />
      )}
    </section>
  );
};

export default QuizPanel;
