// animations.js

import { gsap } from "gsap";
// Optional: import ScrollTrigger if you want to trigger animations on scroll
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// gsap.registerPlugin(ScrollTrigger); // Register plugins if used

export const animateHomeText = (textRef) => {
  if (!textRef.current) return;

  const title = textRef.current.querySelector('.homepage__title');
  const subtitle = textRef.current.querySelector('.homepage__subtitle');
  const button = textRef.current.querySelector('.homepage__button');

  // --- Animation Setup ---
  const masterTl = gsap.timeline({
    delay: 0.5, // Small delay before any animation starts
    defaults: {
      duration: 0.8,
      ease: "power3.out"
    }
  });

  // 1. Title Animation: Word by Word Reveal (simulated without SplitText)
  // We need to wrap each word in a span for this to work
  const titleWords = title.textContent.split(' ').map(word => `<span style="display: inline-block; white-space: nowrap;">${word}</span>`).join(' ');
  title.innerHTML = titleWords;
  const titleSpans = title.querySelectorAll('span');

  masterTl.from(titleSpans, {
    y: 60, // Animate from slightly below
    opacity: 0,
    stagger: 0.1, // Each word appears with a 0.1 second delay
    duration: 0.7,
    ease: "back.out(1.7)" // Bouncy ease for a cool effect
  });

  // 2. Subtitle Animation: Staggered Line/Paragraph Fade-in
  // We'll animate the whole subtitle, but you could split it into lines if needed
  masterTl.from(subtitle, {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: "power2.out",
    // Optional: If you had multiple paragraphs or lines in subtitle, you could stagger them
    // stagger: 0.2
  }, "-=0.4"); // Start subtitle animation slightly before title finishes

  // 3. Button Animation: Scale and Fade-in
  masterTl.from(button, {
    scale: 0.7, // Animate from a smaller scale
    opacity: 0,
    duration: 1,
    ease: "elastic.out(1, 0.5)" // Elastic ease for a cool bounce
  }, "-=0.5"); // Start button animation slightly before subtitle finishes

  // Optional: Add a subtle loop for the button or some other element
  // gsap.to(button, {
  //   y: -5,
  //   repeat: -1,
  //   yoyo: true,
  //   duration: 1.5,
  //   ease: "sine.inOut"
  // });
};
