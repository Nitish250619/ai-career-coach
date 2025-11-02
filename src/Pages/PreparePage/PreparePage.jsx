import React, { useMemo, useState, useEffect } from "react";
import "./PreparePage.scss";
import TopicPills from "../../components/TopicPills/TopicPills";
import ControlsBar from "../../components/ControlsBar/ControlsBar";
import QuizPanel from "../../components/QuizPanel/QuizPanel";
import MachineCodingPanel from "../../components/MachineCodingPanel/MachineCodingPanel";
import Loader from "../../components/Loader/Loader";
import { useAIQuizGenerator } from "../../hooks/useAIQuizGenerator/useAIQuizGenerator";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const TOPICS = [
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "react", label: "React" },
  { id: "js", label: "JavaScript" },
];

const PreparePage = () => {
  const [topic, setTopic] = useState("react");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(10);
  const [mode, setMode] = useState("quiz"); // 'quiz' | 'machine'

  const {
    status,
    questions,
    machinePrompts,
    error,
    generateQuiz,
    generateMachinePrompts,
    explain,
  } = useAIQuizGenerator();

  useEffect(() => {
    // Auto-generate on first mount
    generateQuiz({ topic, difficulty, count: questionCount });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const header = useMemo(() => {
    const t = TOPICS.find((t) => t.id === topic)?.label ?? "React";
    const d = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    return `${t} • ${d}`;
  }, [topic, difficulty]);

  return (
    <div className="prepare-page">
      <header className="prep-header">
        <h1>Prep Lab</h1>
        <p className="subtitle">
          Practice quizzes for HTML, CSS, React & JS + Machine Coding Scenarios
        </p>
      </header>

      <TopicPills topics={TOPICS} value={topic} onChange={(v) => setTopic(v)} />

      <ControlsBar
        difficulties={DIFFICULTIES}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        questionCount={questionCount}
        onQuestionCountChange={setQuestionCount}
        mode={mode}
        onModeChange={setMode}
        onGenerate={() =>
          mode === "quiz"
            ? generateQuiz({ topic, difficulty, count: questionCount })
            : generateMachinePrompts({
                topic,
                difficulty,
                count: Math.min(8, questionCount),
              })
        }
        status={status}
        header={header}
      />

      {error && <div className="error">{error}</div>}

      {status === "loading" ? (
        <Loader
          message={
            mode === "quiz"
              ? "Generating quiz questions…"
              : "Preparing coding problems…"
          }
        />
      ) : mode === "quiz" ? (
        <QuizPanel questions={questions} explain={explain} status={status} />
      ) : (
        <MachineCodingPanel prompts={machinePrompts} status={status} />
      )}
    </div>
  );
};

export default PreparePage;
