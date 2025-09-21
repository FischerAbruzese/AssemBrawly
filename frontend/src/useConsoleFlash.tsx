import { useState, useEffect } from 'react';

export function useConsoleFlash(userConsole: string) {
  const [flashState, setFlashState] = useState('none'); // 'none', 'correct', 'incorrect'

  useEffect(() => {
    if (!userConsole.toLowerCase().includes('incorrect') && userConsole.toLowerCase().includes('correct')) {
      setFlashState('correct');
      const timer = setTimeout(() => setFlashState('none'), 700);
      return () => clearTimeout(timer);
    } else if (userConsole.toLowerCase().includes('incorrect')) {
      setFlashState('incorrect');
      const timer = setTimeout(() => setFlashState('none'), 700);
      return () => clearTimeout(timer);
    }
  }, [userConsole]);

  const getFlashClasses = () => {
    return `transition-all duration-1000 ease-in-out ${
      flashState === 'correct' 
        ? 'bg-green-800 shadow-lg shadow-green-500/20' 
        : flashState === 'incorrect' 
        ? 'bg-red-800 shadow-lg shadow-red-500/20' 
        : 'bg-gray-800'
    }`;
  };

  return { flashClasses: getFlashClasses() };
}