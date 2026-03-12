import React from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import OpeningCinematic from './components/Cinematic/OpeningCinematic';
import LevelMap from './components/LevelMap/LevelMap';
import GameScene from './components/Game/GameScene';

function AppContent() {
  const { screen } = useGame();

  switch (screen) {
    case 'cinematic':
      return <OpeningCinematic />;
    case 'map':
      return <LevelMap />;
    case 'gameplay':
      return <GameScene />;
    default:
      return <LevelMap />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
