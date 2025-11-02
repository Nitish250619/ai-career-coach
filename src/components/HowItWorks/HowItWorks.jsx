import React from "react";
import "./HowItWorks.scss";

const steps = [
  {
    title: "Create Your Profile",
    description:
      "Sign up and share your skills, experience, and goals so the AI understands your strengths.",
    icon: "👤",
  },
  {
    title: "Build Resume & Cover Letter",
    description:
      "Generate job-ready resumes and tailored cover letters that match each description.",
    icon: "📄",
  },
  {
    title: "Prepare with Quizzes",
    description:
      "Practice with AI-powered quizzes and feedback to sharpen your knowledge fast.",
    icon: "🧠",
  },
  {
    title: "Get AI Recommendations",
    description:
      "Receive personalized tips to improve your documents and prep for interviews.",
    icon: "🤖",
  },
];

const HowItWorks = () => {
  return (
    <section className="how-it-works" aria-labelledby="howitworks-title">
      <h2 id="howitworks-title" className="how-it-works__title">
        How It Works
      </h2>

      <p className="how-it-works__intro">
        Four focused steps. One streamlined flow. Get from profile to polished
        application—backed by smart, practical AI guidance.
      </p>

      <ol className="how-it-works__steps">
        {steps.map((step, i) => (
          <li className="step-card" key={step.title}>
            <div className="step-card__halo" aria-hidden />
            <div className="step-card__badge" aria-hidden>
              <span>{i + 1}</span>
            </div>
            <div className="step-card__icon" aria-hidden>
              {step.icon}
            </div>
            <h3 className="step-card__title">{step.title}</h3>
            <p className="step-card__desc">{step.description}</p>
          </li>
        ))}
      </ol>

      <div className="how-it-works__cta">
        <p>Ready to start? Your best application is a few clicks away.</p>
      </div>
    </section>
  );
};

export default HowItWorks;
