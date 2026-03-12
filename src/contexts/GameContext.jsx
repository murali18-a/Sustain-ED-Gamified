import React, { createContext, useContext, useReducer, useCallback } from 'react';
import levelsData from '../data/levels.json';

const GameContext = createContext(null);

const initialState = {
  // Player
  playerName: 'EcoHero',
  
  // Progression
  currentChapter: 1,
  currentLevel: null,
  completedLevels: {},  // { "1.1": { stars: 3, score: 9800 }, ... }
  
  // Economy
  coins: 500,
  gems: 0,
  
  // House state for gameplay
  activeHouse: '1bhk',
  appliances: [],
  
  // UI state
  screen: 'cinematic', // 'cinematic' | 'map' | 'gameplay' | 'profile'
  showLevelModal: null,
  
  // Game flags
  hasSeenCinematic: false,
  tutorialComplete: false,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };
      
    case 'COMPLETE_CINEMATIC':
      return { ...state, hasSeenCinematic: true, screen: 'map' };
    
    case 'SHOW_LEVEL_MODAL':
      return { ...state, showLevelModal: action.payload };
    
    case 'HIDE_LEVEL_MODAL':
      return { ...state, showLevelModal: null };
    
    case 'START_LEVEL':
      return { 
        ...state, 
        currentLevel: action.payload, 
        screen: 'gameplay',
        showLevelModal: null 
      };
    
    case 'COMPLETE_LEVEL': {
      const { levelId, stars, score } = action.payload;
      const existing = state.completedLevels[levelId];
      const bestStars = existing ? Math.max(existing.stars, stars) : stars;
      const bestScore = existing ? Math.max(existing.score, score) : score;
      
      // Find level data for rewards
      const levelData = levelsData.levels.find(l => l.id === levelId);
      const rewardIndex = stars - 1;
      const newCoins = levelData ? levelData.rewards.coins[rewardIndex] : 0;
      const newGems = levelData ? levelData.rewards.gems[rewardIndex] : 0;
      
      return {
        ...state,
        completedLevels: {
          ...state.completedLevels,
          [levelId]: { stars: bestStars, score: bestScore }
        },
        coins: state.coins + newCoins,
        gems: state.gems + newGems,
        screen: 'map',
        currentLevel: null,
      };
    }
    
    case 'SET_APPLIANCES':
      return { ...state, appliances: action.payload };
    
    case 'TOGGLE_APPLIANCE': {
      const appId = action.payload;
      return {
        ...state,
        appliances: state.appliances.map(a => 
          a.id === appId ? { ...a, on: !a.on } : a
        )
      };
    }
    
    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.payload };
    
    case 'BACK_TO_MAP':
      return { ...state, screen: 'map', currentLevel: null };
    
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  // Check localStorage for returning user
  const savedHasSeen = typeof window !== 'undefined' && localStorage.getItem('ecoquest_seen_cinematic');
  
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    hasSeenCinematic: !!savedHasSeen,
    screen: savedHasSeen ? 'map' : 'cinematic',
  });

  const completeCinematic = useCallback(() => {
    localStorage.setItem('ecoquest_seen_cinematic', 'true');
    dispatch({ type: 'COMPLETE_CINEMATIC' });
  }, []);

  const getTotalStars = useCallback(() => {
    return Object.values(state.completedLevels).reduce((sum, l) => sum + l.stars, 0);
  }, [state.completedLevels]);

  const getChapterStars = useCallback((chapterId) => {
    return Object.entries(state.completedLevels)
      .filter(([id]) => id.startsWith(`${chapterId}.`))
      .reduce((sum, [, l]) => sum + l.stars, 0);
  }, [state.completedLevels]);

  const isLevelUnlocked = useCallback((levelId) => {
    // First level always unlocked
    if (levelId === '1.1') return true;
    
    const levelIndex = levelsData.levels.findIndex(l => l.id === levelId);
    if (levelIndex <= 0) return false;
    
    // Previous level must be completed
    const prevLevel = levelsData.levels[levelIndex - 1];
    if (!state.completedLevels[prevLevel.id]) return false;
    
    // Check chapter unlock conditions
    const levelData = levelsData.levels.find(l => l.id === levelId);
    const chapter = levelsData.chapters.find(c => c.id === levelData.chapter);
    if (chapter.unlockCondition) {
      const requiredStars = chapter.unlockCondition.minStars;
      const chapterStars = getChapterStars(chapter.unlockCondition.chapter);
      if (chapterStars < requiredStars) return false;
    }
    
    return true;
  }, [state.completedLevels, getChapterStars]);

  const value = {
    ...state,
    dispatch,
    completeCinematic,
    getTotalStars,
    getChapterStars,
    isLevelUnlocked,
    levelsData: levelsData.levels,
    chaptersData: levelsData.chapters,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}

export default GameContext;
