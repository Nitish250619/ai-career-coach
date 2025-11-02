import React, { useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import "./HeroSection.scss";
import { animateHomeText } from './textAnimationForHero'; // import animation

const HeroSection = () => {
  const textRef = useRef(null);

  useEffect(() => {
    animateHomeText(textRef);
  }, []);

  return (
    <div className="homepage">
      <div className="homepage__text" ref={textRef}>
        <h1 className="homepage__title">Boost Your Career with AI</h1>
        <p className="homepage__subtitle">
          Build professional resumes and cover letters effortlessly, 
          and take skill-based quizzes to prepare for your dream job. 
          Our AI-powered assistant guides you every step of the way.
        </p>
        <button className="homepage__button">Get Started Now</button>
      </div>
      <div className="homepage__robot">
        <Robot />
      </div>
    </div>
  );
};

export default HeroSection;

export function Robot() {
  return (
    <Spline scene="https://prod.spline.design/NmYfkMtczArG09o1/scene.splinecode" />
  );
}



