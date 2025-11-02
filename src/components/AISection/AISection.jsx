import React, { useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Keyboard, A11y, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./AISection.scss";

const slides = [
  {
    id: "resume",
    icon: "📄",
    title: "AI Resume Optimizer",
    desc:
      "Rewrite bullets with impact verbs, quantify outcomes, and align with ATS keywords—formatted for fast screening.",
    bullets: [
      "Action verbs + quantified impact",
      "ATS keyword coverage",
      "Auto section ordering/layout",
      "Project highlights for role",
    ],
  },
  {
    id: "cover",
    icon: "✉️",
    title: "AI Cover Letter Tailor",
    desc:
      "Paste the JD and get a tailored, concise letter with relevant stories, tone-matching, and a confident close.",
    bullets: ["JD-aware tailoring", "Company tone mirroring", "Relevant project mapping", "One-click variants"],
  },
  {
    id: "prep",
    icon: "🧠",
    title: "Frontend Prep Coach",
    desc: "Adaptive quizzes, formatted machine-coding prompts, and interview Q&A with practical trade-offs.",
    bullets: ["React/JS/Browser API quizzes", "Machine-coding specs + tests", "System design talking points", "Behavioral prep hints"],
  },
  {
    id: "portfolio",
    icon: "🧩",
    title: "Portfolio Polisher",
    desc: "Turn projects into compelling case studies—problem, approach, metrics—optimized for recruiters.",
    bullets: ["STAR storytelling", "Impact-first summaries", "Live demo + repo cues", "Role-relevance filter"],
  },
  {
    id: "interview",
    icon: "🎯",
    title: "Interview Finisher",
    desc:
      "Dry-runs with timed rounds, feedback on clarity, and follow-up questions for depth and composure.",
    bullets: ["Timed mocks", "Clarity & structure feedback", "Follow-up question bank", "Post-mortem notes"],
  },
];

export default function AISection() {
  const swiperRef = useRef(null);
  const [active, setActive] = useState(0);

  const onMouseEnter = () => swiperRef.current?.autoplay?.stop();
  const onMouseLeave = () => swiperRef.current?.autoplay?.start();

  const breakpoints = useMemo(
    () => ({
      0:   { slidesPerView: 1,   spaceBetween: 12 },
      640: { slidesPerView: 1.15,spaceBetween: 16 },
      900: { slidesPerView: 1.6, spaceBetween: 18 },
      1200:{ slidesPerView: 2.2, spaceBetween: 22 },
    }),
    []
  );

  return (
    <section className="aiCarousel aiCarousel--swiper" aria-labelledby="aiCarousel-title">
      <header className="aiCarousel__header">
        <h2 id="aiCarousel-title" className="aiCarousel__title">
          How Our AI Helps You Win Interviews
        </h2>
        <p className="aiCarousel__subtitle">
          Center slide stays in focus. Use keyboard arrows, swipe, or let it auto-play.
        </p>
      </header>

      <div className="aiCarousel__stage" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <Swiper
          modules={[Autoplay, EffectCoverflow, Keyboard, A11y, Navigation, Pagination]}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setActive(s.realIndex)}
          effect="coverflow"
          coverflowEffect={{
            rotate: 16,      // Y-rotation
            stretch: 0,
            depth: 140,      // Z depth
            scale: 0.9,      // base scale
            modifier: 1,
            slideShadows: false, // disable heavy shadows for perf
          }}
          centeredSlides
          loop
          watchSlidesProgress
          keyboard={{ enabled: true }}
          autoplay={{ delay: 3600, disableOnInteraction: false, pauseOnMouseEnter: false }}
          navigation
          pagination={{ clickable: true }}
          breakpoints={breakpoints}
          className="aiSwiper"
        >
          {slides.map((s, i) => {
            const isActive = i === active;
            return (
              <SwiperSlide key={s.id} className="aiSlide">
                <article className={`aiSlide__card ${isActive ? "is-active" : ""}`}>
                  {/* Re-mount inner when active changes to replay animations */}
                  <div className="aiSlide__inner" key={isActive ? `active-${active}` : `idle-${i}`}>
                    <div className="aiSlide__icon" aria-hidden>{s.icon}</div>
                    <h3 className="aiSlide__title">{s.title}</h3>
                    <p className="aiSlide__desc">{s.desc}</p>
                    <ul className="aiSlide__list">
                      {s.bullets.map((b, bi) => (
                        <li key={bi} style={{ "--i": bi }}>✓ {b}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
