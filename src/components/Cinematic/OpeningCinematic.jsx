import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import './OpeningCinematic.css';

const SCENES = [
  { id: 'burning-world', duration: 8000 },
  { id: 'polluted-city', duration: 10000 },
  { id: 'call-to-action', duration: 10000 },
  { id: 'transformation', duration: 7000 },
  { id: 'title-screen', duration: 0 }, // stays until tap
];

export default function OpeningCinematic() {
  const { completeCinematic } = useGame();
  const [currentScene, setCurrentScene] = useState(0);
  const [co2Value, setCo2Value] = useState(412);
  const [showSkip, setShowSkip] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Show skip button after 2 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(skipTimer);
  }, []);

  // CO2 counter animation for scene 1
  useEffect(() => {
    if (currentScene === 0) {
      const interval = setInterval(() => {
        setCo2Value(prev => {
          if (prev >= 500) { clearInterval(interval); return 500; }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
    if (currentScene === 3) {
      // Reverse CO2 in transformation scene
      setCo2Value(500);
      const interval = setInterval(() => {
        setCo2Value(prev => {
          if (prev <= 0) { clearInterval(interval); return 0; }
          return prev - 5;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [currentScene]);

  // Auto-advance scenes
  useEffect(() => {
    const scene = SCENES[currentScene];
    if (scene && scene.duration > 0) {
      timerRef.current = setTimeout(() => {
        setCurrentScene(prev => prev + 1);
      }, scene.duration);
      return () => clearTimeout(timerRef.current);
    }
  }, [currentScene]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => completeCinematic(), 800);
  };

  const handleTapToBegin = () => {
    setFadeOut(true);
    setTimeout(() => completeCinematic(), 800);
  };

  const getCo2Color = () => {
    if (currentScene === 3) {
      if (co2Value <= 100) return '#2ecc71';
      if (co2Value <= 300) return '#f1c40f';
      return '#e74c3c';
    }
    if (co2Value < 430) return '#f1c40f';
    if (co2Value < 470) return '#e67e22';
    return '#e74c3c';
  };

  return (
    <div className={`cinematic ${fadeOut ? 'cinematic--fadeout' : ''}`}>
      {/* Skip Button */}
      {showSkip && currentScene < 4 && (
        <button className="cinematic__skip" onClick={handleSkip}>
          Skip ▸▸
        </button>
      )}

      {/* Scene 1: The Burning World */}
      <div className={`cinematic__scene ${currentScene === 0 ? 'active' : ''}`} id="scene-burning">
        <div className="scene-burning__space">
          <div className="stars"></div>
          <div className="stars stars--2"></div>
          <div className="earth earth--polluted">
            <div className="earth__smog"></div>
            <div className="earth__smog earth__smog--2"></div>
          </div>
        </div>
        <div className="co2-counter" style={{ color: getCo2Color() }}>
          <span className="co2-counter__label">CO₂</span>
          <span className="co2-counter__value">{co2Value}</span>
          <span className="co2-counter__unit">ppm</span>
          {co2Value >= 490 && <span className="co2-counter__danger">⚠ DANGER</span>}
        </div>
        <p className="cinematic__text cinematic__text--dramatic">
          The year is 2035. Earth is choking.
        </p>
      </div>

      {/* Scene 2: The Polluted City */}
      <div className={`cinematic__scene ${currentScene === 1 ? 'active' : ''}`} id="scene-polluted">
        <div className="polluted-city">
          <div className="smog-layer"></div>
          <div className="buildings">
            <div className="building building--1">
              <div className="building__windows"></div>
            </div>
            <div className="building building--2">
              <div className="building__windows"></div>
              <div className="factory-smoke">
                <div className="smoke-puff"></div>
                <div className="smoke-puff smoke-puff--2"></div>
                <div className="smoke-puff smoke-puff--3"></div>
              </div>
            </div>
            <div className="building building--3">
              <div className="building__windows"></div>
            </div>
            <div className="building building--4">
              <div className="building__windows"></div>
            </div>
            <div className="building building--5">
              <div className="building__windows"></div>
              <div className="factory-smoke">
                <div className="smoke-puff"></div>
                <div className="smoke-puff smoke-puff--2"></div>
              </div>
            </div>
          </div>
          <div className="traffic">
            <div className="car car--1">🚗</div>
            <div className="car car--2">🚕</div>
            <div className="car car--3">🚙</div>
          </div>
          <div className="citizens">
            <div className="citizen citizen--1">😷</div>
            <div className="citizen citizen--2">🤧</div>
            <div className="citizen citizen--3">😷</div>
          </div>
        </div>
        <div className="bill-overlay">
          <div className="bill">
            <div className="bill__header">ELECTRICITY BILL</div>
            <div className="bill__amount">₹15,000/month</div>
            <div className="bill__stamp">⚠ WARNING</div>
          </div>
        </div>
        <p className="cinematic__text">
          Families are paying more. The planet is paying the most.
        </p>
      </div>

      {/* Scene 3: The Call to Action */}
      <div className={`cinematic__scene ${currentScene === 2 ? 'active' : ''}`} id="scene-call">
        <div className="call-scene">
          <div className="sunbeam"></div>
          <div className="dark-city-bg"></div>
          <div className="small-house">
            <div className="house-roof">▲</div>
            <div className="house-body">
              <div className="house-door"></div>
              <div className="house-window"></div>
            </div>
          </div>
          <div className="kid-avatar">
            <div className="kid-body">🧑‍🎓</div>
            <div className="lightbulb-idea">💡</div>
            <div className="solar-pickup">
              <span className="solar-icon">⚡</span>
            </div>
          </div>
        </div>
        <p className="cinematic__text cinematic__text--hope">
          But one student decided to change everything...
        </p>
      </div>

      {/* Scene 4: The Transformation */}
      <div className={`cinematic__scene ${currentScene === 3 ? 'active' : ''}`} id="scene-transform">
        <div className="transform-scene">
          <div className="transform-montage">
            <div className="montage-item montage-item--solar">☀️ Solar Panels</div>
            <div className="montage-item montage-item--wind">🌬️ Wind Turbines</div>
            <div className="montage-item montage-item--trees">🌳 Forests Grow</div>
            <div className="montage-item montage-item--clean">🏙️ Clean Air</div>
          </div>
          <div className="co2-counter co2-counter--reverse" style={{ color: getCo2Color() }}>
            <span className="co2-counter__label">CO₂</span>
            <span className="co2-counter__value">{co2Value}</span>
            <span className="co2-counter__unit">ppm</span>
            {co2Value <= 10 && <span className="co2-counter__success">🌍 NET ZERO!</span>}
          </div>
          <div className="city-transform">
            <div className="city-color-sweep"></div>
            <div className="birds">
              <span className="bird">🕊️</span>
              <span className="bird bird--2">🕊️</span>
              <span className="bird bird--3">🕊️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 5: Title Screen */}
      <div className={`cinematic__scene ${currentScene === 4 ? 'active' : ''}`} id="scene-title">
        <div className="title-screen">
          <div className="title-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}>{['🌿', '☀️', '💧', '🌱', '⚡', '🍃'][i % 6]}</div>
            ))}
          </div>
          <div className="title-container">
            <div className="title-bolt">⚡</div>
            <h1 className="title-main">
              <span className="title-letter" style={{animationDelay: '0s'}}>E</span>
              <span className="title-letter" style={{animationDelay: '0.05s'}}>C</span>
              <span className="title-letter" style={{animationDelay: '0.1s'}}>O</span>
              <span className="title-letter" style={{animationDelay: '0.15s'}}>Q</span>
              <span className="title-letter" style={{animationDelay: '0.2s'}}>U</span>
              <span className="title-letter" style={{animationDelay: '0.25s'}}>E</span>
              <span className="title-letter" style={{animationDelay: '0.3s'}}>S</span>
              <span className="title-letter" style={{animationDelay: '0.35s'}}>T</span>
            </h1>
            <div className="title-bolt title-bolt--right">⚡</div>
          </div>
          <p className="title-tagline">"Save the Planet, One Home at a Time"</p>
          <button className="tap-to-begin" onClick={handleTapToBegin}>
            <span className="tap-to-begin__icon">☀️</span>
            <span>TAP TO BEGIN</span>
          </button>
        </div>
      </div>
    </div>
  );
}
