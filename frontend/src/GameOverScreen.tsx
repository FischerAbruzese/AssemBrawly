import React, { useState, useEffect } from "react";
import { Trophy, Zap, Star, RotateCcw, Crown } from "lucide-react";
import FloatingAssemblySymbols from "./FloatingAssemblySymbols";
import type { Player } from "./App";

interface GameOverScreenProps {
  winner: Player;
  user: Player;
  onNewGame: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ winner, user, onNewGame }) => {
  console.log("Winner: ", winner.playerName);
  const [animationPhase, setAnimationPhase] = useState(0);
  const isUserWinner = winner.playerName === user.playerName;

  useEffect(() => {
    // Stagger animations
    const timers = [
      setTimeout(() => setAnimationPhase(1), 300),
      setTimeout(() => setAnimationPhase(2), 800),
      setTimeout(() => setAnimationPhase(3), 1300),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
      {/* Floating Assembly Symbols Background */}
      <FloatingAssemblySymbols />
      
      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-8">
        
        {/* Crown/Trophy Section */}
        <div 
          className={`mb-8 transform transition-all duration-1000 ${
            animationPhase >= 1 
              ? "translate-y-0 scale-100 opacity-100" 
              : "translate-y-20 scale-75 opacity-0"
          }`}
        >
          <div className="relative inline-block">
            {isUserWinner ? (
              <Crown 
                className={`w-24 h-24 mx-auto text-green-400 filter drop-shadow-2xl animate-bounce ${
                  animationPhase >= 2 ? "animate-pulse" : ""
                }`} 
              />
            ) : (
              <Trophy 
                className={`w-24 h-24 mx-auto text-blue-400 filter drop-shadow-2xl animate-bounce ${
                  animationPhase >= 2 ? "animate-pulse" : ""
                }`} 
              />
            )}
            
            {/* Lightning bolts around the trophy */}
            <Zap className="absolute -top-2 -left-6 w-8 h-8 text-blue-300 animate-ping" />
            <Zap className="absolute -top-2 -right-6 w-8 h-8 text-blue-300 animate-ping" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>

        {/* Game Over Text */}
        <div 
          className={`mb-6 transform transition-all duration-1000 delay-300 ${
            animationPhase >= 2 
              ? "translate-y-0 opacity-100" 
              : "translate-y-10 opacity-0"
          }`}
        >
          <h1 className="text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              GAME
            </span>{" "}
            <span className="bg-gradient-to-r from-purple-500 to-blue-400 bg-clip-text text-transparent">
              OVER
            </span>
          </h1>
          
          <div className="text-3xl font-semibold mb-4">
            {isUserWinner ? (
              <span className="text-green-400 drop-shadow-lg">
                🎉 Victory! 🎉
              </span>
            ) : (
              <span className="text-blue-400 drop-shadow-lg">
                Better luck next time!
              </span>
            )}
          </div>
        </div>

        {/* Winner Announcement */}
        <div 
          className={`mb-8 transform transition-all duration-1000 delay-500 ${
            animationPhase >= 3 
              ? "translate-y-0 opacity-100" 
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className={`
            relative p-6 rounded-2xl border-2 backdrop-blur-sm
            ${isUserWinner 
              ? "bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/50 shadow-green-400/20" 
              : "bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-500/50 shadow-blue-400/20"
            }
            shadow-2xl
          `}>
            <div className="text-xl text-gray-300 mb-2">Winner:</div>
            <div className={`
              text-4xl font-bold mb-2
              ${isUserWinner ? "text-green-300" : "text-blue-300"}
            `}>
              {winner.playerName}
            </div>
            <div className="text-gray-400 text-lg">
              Congratulations on mastering RISC-V Assembly!
            </div>
            
            {/* Pulsing border effect */}
            <div className={`
              absolute inset-0 rounded-2xl border-2 animate-pulse
              ${isUserWinner ? "border-green-400/30" : "border-blue-400/30"}
            `} />
          </div>
        </div>

        {/* Action Button */}
        <div 
          className={`transform transition-all duration-1000 delay-700 ${
            animationPhase >= 3 
              ? "translate-y-0 opacity-100" 
              : "translate-y-10 opacity-0"
          }`}
        >
          <button
            onClick={onNewGame}
            className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
          >
            <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            <span>Play Again</span>
            
            {/* Button glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
          </button>
          
          <p className="text-gray-400 text-sm mt-4">
            Ready for another round of Assembrawly?
          </p>
        </div>

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }} />
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;