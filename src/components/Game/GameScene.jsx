import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../contexts/GameContext';
import appliancesData from '../../data/appliances.json';
import { calculateCurrentDraw, calculateTotalMonthlyBill, calculateCostPerHour, formatCurrency, formatWatts } from '../../utils/energyFormulas';
import './GameScene.css';

// Rooms in the 1BHK house
const ROOMS = [
  { id: 'living_room', name: 'Living Room', icon: '🛋️', color: '#3498db' },
  { id: 'bedroom', name: 'Bedroom', icon: '🛏️', color: '#9b59b6' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳', color: '#e67e22' },
  { id: 'bathroom', name: 'Bathroom', icon: '🚿', color: '#1abc9c' },
];

export default function GameScene() {
  const { currentLevel, dispatch } = useGame();
  const [activeRoom, setActiveRoom] = useState('living_room');
  const [appliances, setAppliances] = useState([]);
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [sparkyMood, setSparkyMood] = useState('happy');
  const [sparkyMessage, setSparkyMessage] = useState('Welcome to your new home! Tap on any appliance to learn about it! ⚡');
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [interactedCount, setInteractedCount] = useState(0);
  const [score, setScore] = useState(0);

  // Initialize appliances for the level
  useEffect(() => {
    const initialAppliances = appliancesData.appliances.map(app => ({
      ...app,
      on: ['refrigerator', 'wifi_router'].includes(app.id), // Always-on appliances
      interacted: false,
    }));
    setAppliances(initialAppliances);
  }, []);

  // Filter appliances by current room
  const roomAppliances = useMemo(() => {
    return appliances.filter(a => a.room === activeRoom);
  }, [appliances, activeRoom]);

  // Calculate real-time energy stats
  const currentDraw = useMemo(() => calculateCurrentDraw(appliances), [appliances]);
  const monthlyBill = useMemo(() => calculateTotalMonthlyBill(appliances), [appliances]);
  const costPerHour = useMemo(() => calculateCostPerHour(currentDraw), [currentDraw]);

  // Update Sparky's mood based on energy consumption
  useEffect(() => {
    if (currentDraw > 2000) {
      setSparkyMood('angry');
    } else if (currentDraw > 800) {
      setSparkyMood('worried');
    } else {
      setSparkyMood('happy');
    }
  }, [currentDraw]);

  const handleToggleAppliance = (appId) => {
    setAppliances(prev => prev.map(a => {
      if (a.id === appId) {
        const newState = !a.on;
        // Sparky reacts
        if (newState && a.wattage > 1000) {
          setSparkyMessage(`Whoa! ${a.name} just turned on — that's ${formatWatts(a.wattage)}! 😰`);
        } else if (!newState && a.wattage > 500) {
          setSparkyMessage(`Nice! Turning off the ${a.name} saves ${formatCurrency(calculateCostPerHour(a.wattage))}/hr! 💚`);
        }
        return { ...a, on: newState };
      }
      return a;
    }));
  };

  const handleTapAppliance = (app) => {
    setSelectedAppliance(app);
    // Mark as interacted
    if (!app.interacted) {
      setAppliances(prev => prev.map(a => 
        a.id === app.id ? { ...a, interacted: true } : a
      ));
      setInteractedCount(prev => prev + 1);
      setScore(prev => prev + 100);
    }
    // Sparky says the intro
    setSparkyMessage(app.dialogue.intro);
  };

  const handleQuiz = () => {
    if (selectedAppliance?.quiz?.length > 0) {
      setShowQuiz(true);
      setQuizAnswer(null);
    }
  };

  const handleQuizAnswer = (index) => {
    const quiz = selectedAppliance.quiz[0];
    setQuizAnswer(index);
    if (index === quiz.answer) {
      setScore(prev => prev + 500);
      setSparkyMessage(`🎉 Correct! ${quiz.explanation}`);
      setSparkyMood('happy');
    } else {
      setSparkyMessage(`Not quite! ${quiz.explanation}`);
      setSparkyMood('worried');
    }
  };

  const handleCompleteLevel = () => {
    const totalAppliances = appliancesData.appliances.length;
    let stars = 1;
    if (interactedCount >= totalAppliances * 0.7) stars = 2;
    if (interactedCount >= totalAppliances) stars = 3;
    
    dispatch({ 
      type: 'COMPLETE_LEVEL', 
      payload: { 
        levelId: currentLevel?.id || '1.1', 
        stars, 
        score 
      } 
    });
  };

  const sparkyFace = {
    happy: '😊',
    worried: '😟',
    angry: '😡',
  };

  return (
    <div className="game-scene">
      {/* Back button */}
      <button className="game-back-btn" onClick={() => dispatch({ type: 'BACK_TO_MAP' })}>
        ← Back
      </button>

      {/* Level info */}
      <div className="game-level-info">
        <span className="game-level-info__id">Level {currentLevel?.id || '1.1'}</span>
        <span className="game-level-info__name">{currentLevel?.name || 'Move-In Day'}</span>
      </div>

      {/* Sparky companion */}
      <div className={`sparky sparky--${sparkyMood}`}>
        <div className="sparky__face">{sparkyFace[sparkyMood]}</div>
        <div className="sparky__name">⚡ SPARKY</div>
        <div className="sparky__speech">
          <p>{sparkyMessage}</p>
        </div>
      </div>

      {/* Energy Meter Dashboard */}
      <div className="energy-dashboard">
        <div className="energy-dashboard__header">
          <span>⚡ Live Energy</span>
        </div>
        <div className="energy-stats">
          <div className="energy-stat">
            <span className="energy-stat__label">Current</span>
            <span className="energy-stat__value" style={{ color: currentDraw > 2000 ? 'var(--alizarin)' : currentDraw > 800 ? 'var(--gold)' : 'var(--emerald)' }}>
              {formatWatts(currentDraw)}
            </span>
          </div>
          <div className="energy-stat">
            <span className="energy-stat__label">₹/hour</span>
            <span className="energy-stat__value">{formatCurrency(costPerHour)}</span>
          </div>
          <div className="energy-stat">
            <span className="energy-stat__label">Monthly</span>
            <span className="energy-stat__value" style={{ color: monthlyBill > 4000 ? 'var(--alizarin)' : monthlyBill > 2500 ? 'var(--gold)' : 'var(--emerald)' }}>
              {formatCurrency(monthlyBill)}
            </span>
          </div>
        </div>
        {/* Mini power bar */}
        <div className="power-bar">
          <div 
            className="power-bar__fill" 
            style={{ 
              width: `${Math.min((currentDraw / 5000) * 100, 100)}%`,
              background: currentDraw > 2000 ? 'var(--alizarin)' : currentDraw > 800 ? 'var(--gold)' : 'var(--emerald)'
            }} 
          />
        </div>
      </div>

      {/* Room Tabs */}
      <div className="room-tabs">
        {ROOMS.map(room => (
          <button
            key={room.id}
            className={`room-tab ${activeRoom === room.id ? 'room-tab--active' : ''}`}
            onClick={() => { setActiveRoom(room.id); setSelectedAppliance(null); setShowQuiz(false); }}
            style={activeRoom === room.id ? { borderColor: room.color, background: `${room.color}22` } : {}}
          >
            <span className="room-tab__icon">{room.icon}</span>
            <span className="room-tab__name">{room.name}</span>
          </button>
        ))}
      </div>

      {/* Room Content — Appliance Grid */}
      <div className="room-content">
        <div className="appliance-grid">
          {roomAppliances.map(app => (
            <div
              key={app.id}
              className={`appliance-card ${app.on ? 'appliance-card--on' : 'appliance-card--off'} ${selectedAppliance?.id === app.id ? 'appliance-card--selected' : ''} ${app.interacted ? 'appliance-card--interacted' : ''}`}
              onClick={() => handleTapAppliance(app)}
            >
              <div className="appliance-card__icon-wrap">
                <span className="appliance-card__icon">{app.icon}</span>
                {app.on && <span className="appliance-card__power-indicator" />}
              </div>
              <span className="appliance-card__name">{app.name}</span>
              <span className="appliance-card__watts">{app.on ? formatWatts(app.wattage) : 'OFF'}</span>
              <button
                className={`appliance-toggle ${app.on ? 'appliance-toggle--on' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleToggleAppliance(app.id); }}
              >
                {app.on ? 'ON' : 'OFF'}
              </button>
              {!app.interacted && <span className="appliance-card__new-badge">NEW</span>}
            </div>
          ))}
          {roomAppliances.length === 0 && (
            <div className="room-empty">
              <p>No appliances in this room yet!</p>
            </div>
          )}
        </div>
      </div>

      {/* Appliance Detail Panel */}
      {selectedAppliance && !showQuiz && (
        <div className="appliance-panel">
          <div className="appliance-panel__header">
            <span className="appliance-panel__icon">{selectedAppliance.icon}</span>
            <div>
              <h3>{selectedAppliance.name}</h3>
              <span className="appliance-panel__rating">
                {'⭐'.repeat(selectedAppliance.starRating)}{'☆'.repeat(5 - selectedAppliance.starRating)}
              </span>
            </div>
            <button className="appliance-panel__close" onClick={() => setSelectedAppliance(null)}>✕</button>
          </div>

          <div className="appliance-panel__stats">
            <div className="panel-stat">
              <span className="panel-stat__icon">⚡</span>
              <span className="panel-stat__label">Power</span>
              <span className="panel-stat__value">{formatWatts(selectedAppliance.wattage)}</span>
            </div>
            <div className="panel-stat">
              <span className="panel-stat__icon">💰</span>
              <span className="panel-stat__label">₹/hour</span>
              <span className="panel-stat__value">{formatCurrency(calculateCostPerHour(selectedAppliance.wattage))}</span>
            </div>
            <div className="panel-stat">
              <span className="panel-stat__icon">📅</span>
              <span className="panel-stat__label">Monthly</span>
              <span className="panel-stat__value">{formatCurrency((selectedAppliance.wattage * selectedAppliance.hoursPerDay * 30) / 1000 * 8)}</span>
            </div>
          </div>

          {/* Tips */}
          <div className="appliance-panel__tips">
            <h4>💡 Tips to Save</h4>
            <ul>
              {selectedAppliance.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>

          {/* Tap facts */}
          <div className="appliance-panel__facts">
            {selectedAppliance.dialogue.tap.map((fact, i) => (
              <p key={i} className="fact-bubble">💬 {fact}</p>
            ))}
          </div>

          {/* Actions */}
          <div className="appliance-panel__actions">
            {selectedAppliance.quiz?.length > 0 && (
              <button className="btn btn-gold" onClick={handleQuiz}>🧠 Quiz Me!</button>
            )}
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && selectedAppliance?.quiz?.length > 0 && (
        <div className="quiz-overlay">
          <div className="quiz-card">
            <div className="quiz-card__header">
              <span className="quiz-card__icon">{selectedAppliance.icon}</span>
              <h3>Quiz Time!</h3>
            </div>
            <p className="quiz-card__question">{selectedAppliance.quiz[0].question}</p>
            <div className="quiz-card__options">
              {selectedAppliance.quiz[0].options.map((opt, i) => (
                <button
                  key={i}
                  className={`quiz-option ${
                    quizAnswer !== null 
                      ? i === selectedAppliance.quiz[0].answer 
                        ? 'quiz-option--correct' 
                        : i === quizAnswer 
                          ? 'quiz-option--wrong' 
                          : 'quiz-option--disabled'
                      : ''
                  }`}
                  onClick={() => quizAnswer === null && handleQuizAnswer(i)}
                  disabled={quizAnswer !== null}
                >
                  <span className="quiz-option__letter">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>
            {quizAnswer !== null && (
              <div className={`quiz-card__result ${quizAnswer === selectedAppliance.quiz[0].answer ? 'quiz-card__result--correct' : 'quiz-card__result--wrong'}`}>
                <p>{quizAnswer === selectedAppliance.quiz[0].answer ? '🎉 Correct!' : '❌ Not quite!'}</p>
                <p className="quiz-card__explanation">{selectedAppliance.quiz[0].explanation}</p>
                <button className="btn btn-primary" onClick={() => { setShowQuiz(false); }}>Continue</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Score & Progress */}
      <div className="game-progress">
        <div className="game-progress__score">Score: {score.toLocaleString()}</div>
        <div className="game-progress__bar">
          <div className="progress-fill" style={{ width: `${(interactedCount / appliancesData.appliances.length) * 100}%` }} />
        </div>
        <div className="game-progress__count">{interactedCount}/{appliancesData.appliances.length} appliances explored</div>
        {interactedCount >= 3 && (
          <button className="btn btn-primary btn-lg" onClick={handleCompleteLevel}>
            ✅ Complete Level
          </button>
        )}
      </div>
    </div>
  );
}
