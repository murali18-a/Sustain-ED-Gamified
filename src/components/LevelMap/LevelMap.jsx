import React, { useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import './LevelMap.css';

export default function LevelMap() {
  const { chaptersData, levelsData, completedLevels, isLevelUnlocked, dispatch, coins, gems, getTotalStars, playerName } = useGame();
  const mapRef = useRef(null);

  const handleLevelClick = (level) => {
    if (!isLevelUnlocked(level.id)) return;
    dispatch({ type: 'SHOW_LEVEL_MODAL', payload: level });
  };

  const getLevelStars = (levelId) => {
    return completedLevels[levelId]?.stars || 0;
  };

  const renderStars = (count) => {
    return (
      <div className="level-stars">
        {[1, 2, 3].map(i => (
          <span key={i} className={`star ${i <= count ? 'star--earned' : 'star--empty'}`}>
            {i <= count ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  // Group levels by chapter
  const chaptersWithLevels = chaptersData.map(chapter => ({
    ...chapter,
    levels: levelsData.filter(l => l.chapter === chapter.id)
  }));

  return (
    <div className="level-map">
      {/* Top HUD */}
      <div className="map-hud">
        <div className="hud-left">
          <span className="hud-avatar">🧑‍🎓</span>
          <span className="hud-name">{playerName}</span>
        </div>
        <div className="hud-center">
          <div className="hud-stat">
            <span className="hud-stat__icon">⭐</span>
            <span className="hud-stat__value">{getTotalStars()}</span>
          </div>
        </div>
        <div className="hud-right">
          <div className="hud-stat">
            <span className="hud-stat__icon">🪙</span>
            <span className="hud-stat__value">{coins.toLocaleString()}</span>
          </div>
          <div className="hud-stat">
            <span className="hud-stat__icon">💎</span>
            <span className="hud-stat__value">{gems}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Map */}
      <div className="map-scroll" ref={mapRef}>
        <div className="map-path">
          {chaptersWithLevels.map((chapter, ci) => (
            <div 
              key={chapter.id} 
              className={`chapter-section chapter-section--${chapter.bgTheme}`}
            >
              {/* Chapter Header */}
              <div className="chapter-header">
                <span className="chapter-header__icon">{chapter.icon}</span>
                <div className="chapter-header__info">
                  <span className="chapter-header__number">Chapter {chapter.id}</span>
                  <h2 className="chapter-header__name">{chapter.name}</h2>
                </div>
              </div>

              {/* Level Nodes */}
              <div className="chapter-levels">
                {chapter.levels.map((level, li) => {
                  const unlocked = isLevelUnlocked(level.id);
                  const stars = getLevelStars(level.id);
                  const isEvenRow = li % 2 === 0;
                  
                  return (
                    <div 
                      key={level.id} 
                      className={`level-node-wrapper ${isEvenRow ? 'level-node-wrapper--left' : 'level-node-wrapper--right'}`}
                    >
                      {/* Path connector */}
                      {li > 0 && (
                        <div className={`path-connector ${unlocked ? 'path-connector--active' : ''}`}>
                          <svg viewBox="0 0 100 40" className="path-line">
                            <path 
                              d={isEvenRow ? 'M 80 0 Q 50 20 20 40' : 'M 20 0 Q 50 20 80 40'} 
                              stroke={unlocked ? chapter.color : '#333'} 
                              strokeWidth="3" 
                              fill="none"
                              strokeDasharray={unlocked ? 'none' : '6 4'}
                            />
                          </svg>
                        </div>
                      )}

                      {/* Level Node */}
                      <button
                        className={`level-node ${unlocked ? 'level-node--unlocked' : 'level-node--locked'} ${level.isBoss ? 'level-node--boss' : ''} ${stars === 3 ? 'level-node--perfect' : ''}`}
                        onClick={() => handleLevelClick(level)}
                        disabled={!unlocked}
                        style={unlocked ? { borderColor: chapter.color, '--glow': chapter.color } : {}}
                      >
                        {!unlocked && <span className="level-node__lock">🔒</span>}
                        {unlocked && (
                          <>
                            {level.isBoss ? (
                              <span className="level-node__boss-icon">💀</span>
                            ) : (
                              <span className="level-node__number">{level.id}</span>
                            )}
                          </>
                        )}
                      </button>

                      {/* Stars */}
                      {unlocked && renderStars(stars)}
                      
                      {/* Level name */}
                      <span className={`level-node__name ${!unlocked ? 'level-node__name--locked' : ''}`}>
                        {level.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level Start Modal */}
      <LevelModal />
    </div>
  );
}

function LevelModal() {
  const { showLevelModal, completedLevels, dispatch } = useGame();
  
  if (!showLevelModal) return null;
  
  const level = showLevelModal;
  const existing = completedLevels[level.id];
  
  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'HIDE_LEVEL_MODAL' })}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-card__header">
          {level.isBoss && <span className="modal-boss-badge">⚔️ BOSS</span>}
          <h3 className="modal-card__title">{level.name}</h3>
          <span className="modal-card__level">Level {level.id}</span>
        </div>

        {/* Objective */}
        <div className="modal-card__objective">
          <span className="modal-card__label">🎯 Objective</span>
          <p>{level.objective}</p>
        </div>

        {/* Star Criteria */}
        <div className="modal-card__stars">
          <span className="modal-card__label">⭐ Star Criteria</span>
          <ul>
            <li className={existing?.stars >= 1 ? 'achieved' : ''}>
              <span>⭐</span> {level.starCriteria['1']}
            </li>
            <li className={existing?.stars >= 2 ? 'achieved' : ''}>
              <span>⭐⭐</span> {level.starCriteria['2']}
            </li>
            <li className={existing?.stars >= 3 ? 'achieved' : ''}>
              <span>⭐⭐⭐</span> {level.starCriteria['3']}
            </li>
          </ul>
        </div>

        {/* Rewards Preview */}
        <div className="modal-card__rewards">
          <span className="modal-card__label">🎁 Rewards</span>
          <div className="rewards-row">
            <span>🪙 {level.rewards.coins[2]}</span>
            {level.rewards.gems[2] > 0 && <span>💎 {level.rewards.gems[2]}</span>}
          </div>
        </div>

        {/* Best Score */}
        {existing && (
          <div className="modal-card__best">
            <span>Best: {'⭐'.repeat(existing.stars)} — Score: {existing.score?.toLocaleString()}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="modal-card__actions">
          <button 
            className="btn btn-ghost" 
            onClick={() => dispatch({ type: 'HIDE_LEVEL_MODAL' })}
          >
            Back
          </button>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => dispatch({ type: 'START_LEVEL', payload: level })}
          >
            {existing ? '🔄 Replay' : '▶ Play'}
          </button>
        </div>
      </div>
    </div>
  );
}
