import React, { useEffect, useRef, useState } from 'react';
import x86SamplesText from './assets/x86Samples.txt?raw';

interface FloatingSymbol {
  id: number;
  symbol: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

const FloatingAssemblySymbols: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const symbolsRef = useRef<FloatingSymbol[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  const assemblySymbols = x86SamplesText.trim().split('\n');

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize symbols
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const symbolCount = Math.min(
      50,
      Math.max(20, Math.floor((dimensions.width * dimensions.height) / 15000))
    );

    symbolsRef.current = Array.from({ length: symbolCount }, (_, i) => ({
      id: i,
      symbol: assemblySymbols[Math.floor(Math.random() * assemblySymbols.length)],
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: Math.random() * 16 + 8,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.3 + 0.05,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 0.5
    }));
  }, [dimensions]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const container = containerRef.current;
      if (!container) return;

      const children = container.children;

      symbolsRef.current.forEach((symbol, i) => {
        let newY = symbol.y - symbol.speed;
        let newX = symbol.x;
        const newRotation = symbol.rotation + symbol.rotationSpeed;

        if (newY < -50) {
          newY = dimensions.height + 50;
          newX = Math.random() * dimensions.width;
          if (Math.random() < 0.1) {
            symbol.symbol = assemblySymbols[Math.floor(Math.random() * assemblySymbols.length)];
            symbol.size = Math.random() * 16 + 8;
            symbol.speed = Math.random() * 0.5 + 0.1;
            symbol.opacity = Math.random() * 0.3 + 0.05;
          }
        }

        if (Math.random() < 0.01) {
          newX += (Math.random() - 0.5) * 0.5;
        }

        if (newX < -50) newX = dimensions.width + 50;
        if (newX > dimensions.width + 50) newX = -50;

        symbol.x = newX;
        symbol.y = newY;
        symbol.rotation = newRotation % 360;

        const el = children[i] as HTMLElement;
        if (el) {
          el.style.transform = `translate(${symbol.x}px, ${symbol.y}px) rotate(${symbol.rotation}deg)`;
          el.style.opacity = String(symbol.opacity);
          el.style.fontSize = `${symbol.size}px`;
        }
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [dimensions]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {symbolsRef.current.map(symbol => (
        <div
          key={symbol.id}
          className="absolute font-mono font-bold text-gray-400 select-none"
          style={{
            transform: `translate(${symbol.x}px, ${symbol.y}px) rotate(${symbol.rotation}deg)`,
            fontSize: `${symbol.size}px`,
            opacity: symbol.opacity,
            textShadow: '0 0 10px rgba(156, 163, 175, 0.3)',
            willChange: 'transform'
          }}
        >
          {symbol.symbol}
        </div>
      ))}
    </div>
  );
};

export default FloatingAssemblySymbols;
