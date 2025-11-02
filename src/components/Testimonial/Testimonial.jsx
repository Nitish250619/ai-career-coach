import React, { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "./Testimonial.scss";

const TESTIMONIALS = [
  { name: "Aarav Sharma", role: "Frontend Engineer", text: "This AI coach transformed my resume. I got callbacks within a week — the phrasing and structure were spot on.", avatar: "https://i.pravatar.cc/120?img=5" },
  { name: "Ishita Verma", role: "Product Designer", text: "Cover letters used to take me hours. Now I generate tailored drafts in minutes and just tweak tone.", avatar: "https://i.pravatar.cc/120?img=32" },
  { name: "Rahul Mehta", role: "SDE II", text: "The quizzes pinpointed my weak areas before interviews. Instant feedback = huge confidence boost.", avatar: "https://i.pravatar.cc/120?img=15" },
  { name: "Neha Gupta", role: "Data Analyst", text: "Clean, modern, and smart. It aligned my experience with the JD and made my achievements measurable.", avatar: "https://i.pravatar.cc/120?img=21" },
  { name: "Akash Patel", role: "Mobile Developer", text: "The suggestions felt human — quantified impact, better verbs, clearer outcomes. Massive upgrade.", avatar: "https://i.pravatar.cc/120?img=41" },
];

function Row({
  items,
  reverse = false,
  speed = 4000, // lower = faster (ms per “loop step”)
}) {
  const rowRef = useRef(null);
  const swiperRef = useRef(null);

  // Pause autoplay when row is offscreen (battery/perf friendly)
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!swiperRef.current) return;
        if (entry.isIntersecting) swiperRef.current.autoplay?.start();
        else swiperRef.current.autoplay?.stop();
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`tmn__viewport ${reverse ? "is-reverse" : ""}`} ref={rowRef}>
      <Swiper
        modules={[Autoplay, FreeMode, A11y]}
        onSwiper={(s) => (swiperRef.current = s)}
        slidesPerView="3"
        spaceBetween={16}
        loop
        freeMode={{ enabled: true, momentum: false }}
        allowTouchMove={true}
        speed={speed}
        autoplay={{
          delay: 0, // continuous
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          reverseDirection: reverse,
        }}
        className="tmn__swiper"
        aria-label={reverse ? "Testimonials row reverse" : "Testimonials row"}
      >
        {items.concat(items).map((t, i) => (
          <SwiperSlide className="tmn__slide" key={`${t.name}-${i}`}>
            <article className="tmn__card">
              <div className="tmn__cardHead">
                <img
                  className="tmn__avatar"
                  src={t.avatar}
                  alt={`${t.name} avatar`}
                  loading="lazy"
                  decoding="async"
                />
                <div className="tmn__meta">
                  <strong className="tmn__name">{t.name}</strong>
                  <span className="tmn__role">{t.role}</span>
                  <span className="tmn__stars" aria-label="5 out of 5 stars">
                    ★★★★★
                  </span>
                </div>
              </div>
              <p className="tmn__text">“{t.text}”</p>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

const Testimonial = () => {
  return (
    <section className="tmn" aria-labelledby="tmn-title">
      <div className="tmn__header">
        <h2 id="tmn-title" className="tmn__title">Loved by candidates leveling up with AI</h2>
        <p className="tmn__subtitle">
          Real results. Real careers. Glide through success stories below — forever scrolling ✨
        </p>
      </div>

      {/* Row 1 (left→right) */}
      <Row items={TESTIMONIALS} reverse={false} speed={4500} />

      {/* Row 2 (right→left, slightly different speed for parallax feel) */}
      <Row items={TESTIMONIALS} reverse speed={5200} />
    </section>
  );
};

export default Testimonial;
