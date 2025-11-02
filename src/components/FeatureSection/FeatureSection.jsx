import React from "react";
import "./FeatureSection.scss";

const features = [
  {
    title: "Resume Builder",
    description:
      "Let AI craft a job-winning resume in minutes. Highlight your unique strengths with smart wording and perfect formatting — no manual editing needed.",
    icon: "📄",
  },
  {
    title: "Cover Letter Creator",
    description:
      "Generate personalized cover letters that match each job description. Sound professional, confident, and tailored — every single time.",
    icon: "✉️",
  },
  {
    title: "AI Skill Preparation",
    description:
      "Boost your confidence with AI-powered quizzes and mock interviews. Get instant feedback and identify areas to improve before the real thing.",
    icon: "🧠",
  },
];

const FeatureSection = () => {
  return (
    <section className="features">
      <h2 className="features__title">Why Choose Our AI Career Coach?</h2>

      <p className="features__intro">
        Our AI Career Coach helps you unlock your full potential. It simplifies
        every career-building step — from crafting a resume to acing your next
        interview — with intelligent automation and personalized insights.
      </p>

      <div className="features__grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-card__glow"></div>
            <div className="feature-card__icon">{feature.icon}</div>
            <h3 className="feature-card__title">{feature.title}</h3>
            <p className="feature-card__desc">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="features__bottom">
        <h3>🚀 Empower your career with AI</h3>
        <p>
          Whether you're applying for your first job or aiming for a promotion,
          our AI tools make career growth effortless. Save time, look polished,
          and stand out with data-driven precision and creativity — powered by AI.
        </p>
      </div>
    </section>
  );
};

export default FeatureSection;
