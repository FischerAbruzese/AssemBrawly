import { useState, useEffect, useRef } from 'react';

// Generic flash hook that can be used for any type of flashing
export function useFlash() {
  const [flashState, setFlashState] = useState<'none' | 'flash'>('none');
  
  const triggerFlash = (duration: number = 700) => {
    setFlashState('flash');
    const timer = setTimeout(() => setFlashState('none'), duration);
    return () => clearTimeout(timer);
  };

  return { flashState, triggerFlash };
}

// Console flash hook with success/error states
export function useConsoleFlash(userConsole: string) {
  const [flashState, setFlashState] = useState<'none' | 'correct' | 'incorrect'>('none');
  
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

  return { flashClasses: getFlashClasses(), flashState };
}

// Health flash hook that triggers when health decreases
export function useHealthFlash(health: number) {
  const [flashState, setFlashState] = useState<'none' | 'damage'>('none');
  const prevHealthRef = useRef(health);
  
  useEffect(() => {
    // Only flash when health decreases (not on initial mount)
    if (prevHealthRef.current > health && prevHealthRef.current !== undefined) {
      setFlashState('damage');
      const timer = setTimeout(() => setFlashState('none'), 700);
      return () => clearTimeout(timer);
    }
    prevHealthRef.current = health;
  }, [health]);

  const getFlashClasses = () => {
    return `transition-all duration-1000 ease-in-out ${
      flashState === 'damage'
        ? 'bg-red-900 shadow-lg shadow-red-500/30 border-red-500'
        : ''
    }`;
  };

  return { flashClasses: getFlashClasses(), flashState };
}

// Problem flash hook (simplified version of your existing logic)
export function useProblemFlash(problemDescription: string) {
  const [flashState, setFlashState] = useState<'none' | 'flash'>('none');
  
  useEffect(() => {
    if (problemDescription) {
      setFlashState('flash');
      const timer = setTimeout(() => setFlashState('none'), 700);
      return () => clearTimeout(timer);
    }
  }, [problemDescription]);

  const getFlashClasses = () => {
    return `transition-all duration-1000 ease-in-out ${
      flashState === 'flash'
        ? 'bg-purple-800 shadow-lg shadow-purple-500/20'
        : 'bg-transparent'
    }`;
  };

  return { flashClasses: getFlashClasses(), flashState };
}