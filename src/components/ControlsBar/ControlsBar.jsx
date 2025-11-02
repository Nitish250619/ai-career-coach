import React from 'react';
import "./ControlsBar.scss"
const ControlsBar = ({
  difficulties,
  difficulty,
  onDifficultyChange,
  questionCount,
  onQuestionCountChange,
  mode,
  onModeChange,
  onGenerate,
  status,
  header,
}) => {
  return (
    <section className="controls">
      <div className="row">
        <div className="stretch">
          <h2>{header}</h2>
        </div>
        <div className="mode-toggle">
          <button className={`tab ${mode === 'quiz' ? 'active' : ''}`} onClick={() => onModeChange('quiz')}>Quiz</button>
          <button className={`tab ${mode === 'machine' ? 'active' : ''}`} onClick={() => onModeChange('machine')}>Machine Coding</button>
        </div>
      </div>

      <div className="row grid">
        <label className="field">
          <span>Difficulty</span>
          <select value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)}>
            {difficulties.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Question Count</span>
          <input
            type="number"
            min={5}
            max={30}
            step={1}
            value={questionCount}
            onChange={(e) => onQuestionCountChange(Number(e.target.value))}
          />
        </label>
        <div className="grow" />
        <button className="generate" onClick={onGenerate} disabled={status === 'loading'}>
          {status === 'loading' ? 'Generating…' : 'Generate'}
        </button>
      </div>
    </section>
  );
};

export default ControlsBar;