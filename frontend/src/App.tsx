import { useState, useEffect, useMemo } from "react";
import "./App.css";
import GamePage from "./GamePage";
import StartPage from "./StartPage";
import GameOverScreen from "./GameOverScreen";
import { useWebSocket } from "./WebSocket";

export interface Player {
  playerCode: string;
  playerConsole: string;
  playerHealth: number;
  playerLanguage: string;
  playerName: string;
  setPlayerCode: (playerCode: string) => void;
  setPlayerConsole: (playerConsole: string) => void;
  setPlayerHealth: (playerHealth: number) => void;
  setPlayerLanguage: (playerLanguage: string) => void;
  setPlayerName: (playerName: string) => void;
}

// Define the type for gameRunning
export type GameRunningState = boolean | string;

function App() {
  const [gameRunning, setGameRunning] = useState<GameRunningState>(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  
  const [opponentCode, setOpponentCode] = useState("");
  const [opponentConsole, setOpponentConsole] = useState("");
  const [opponentHealth, setOpponentHealth] = useState(5);
  const [opponentLanguage, setOpponentLanguage] = useState("RISC-V");
  const [opponentName, setOpponentName] = useState("Opponent");
 
  const opponent: Player = useMemo(() => ({
    playerCode: opponentCode,
    playerConsole: opponentConsole,
    playerHealth: opponentHealth,
    playerLanguage: opponentLanguage,
    playerName: opponentName,
    setPlayerCode: setOpponentCode,
    setPlayerConsole: setOpponentConsole,
    setPlayerHealth: setOpponentHealth,
    setPlayerLanguage: setOpponentLanguage,
    setPlayerName: setOpponentName
  }), [opponentCode, opponentConsole, opponentHealth, opponentLanguage, opponentName]);
 
  const [userCode, setUserCode] = useState("");
  const [userConsole, setUserConsole] = useState("");
  const [userHealth, setUserHealth] = useState(5);
  const [userLanguage, setUserLanguage] = useState("RISC-V");
  const [userName, setUserName] = useState("");
 
  const user: Player = useMemo(() => ({
    playerCode: userCode,
    playerConsole: userConsole,
    playerHealth: userHealth,
    playerLanguage: userLanguage,
    playerName: userName,
    setPlayerCode: setUserCode,
    setPlayerConsole: setUserConsole,
    setPlayerHealth: setUserHealth,
    setPlayerLanguage: setUserLanguage,
    setPlayerName: setUserName
  }), [userCode, userConsole, userHealth, userLanguage, userName]);
 
  // WebSocket management at the app level
  const address = "wss://609c23f26da3.ngrok-free.app/2player";
  const webSocketProps = useWebSocket(address, setGameRunning, user, opponent);

  // Check for game over conditions
  useEffect(() => {
    if (gameRunning === true && (userHealth <= 0 || opponentHealth <= 0)) {
      setGameRunning(false);
      setGameOver(true);
      
      // Determine winner
      if (userHealth <= 0 && opponentHealth <= 0) {
        // It's a tie, but we need to pick someone - let's say opponent wins ties
        setWinner(opponent);
      } else if (userHealth <= 0) {
        setWinner(opponent);
      } else {
        setWinner(user);
      }
    }
  }, [userHealth, opponentHealth, gameRunning, user, opponent]);

  // Handle new game - reset all state and reconnect
  const handleNewGame = () => {
    // Reset game states
    setGameOver(false);
    setWinner(null);
    setGameRunning(false);
    
    // Reset user state
    setUserCode("");
    setUserConsole("");
    setUserHealth(5);
    setUserLanguage("RISC-V");
    setUserName("");
    
    // Reset opponent state
    setOpponentCode("");
    setOpponentConsole("");
    setOpponentHealth(5);
    setOpponentLanguage("RISC-V");
    setOpponentName("Opponent");
    
    // The WebSocket will automatically reconnect when we return to StartPage
    // due to the useWebSocket hook being re-initialized
  };
 
  return (
    <div>
      {gameOver && winner ? (
        <GameOverScreen 
          winner={winner} 
          user={user} 
          onNewGame={handleNewGame} 
        />
      ) : gameRunning === true ? (
        <GamePage 
          setGameRunning={setGameRunning} 
          webSocketProps={webSocketProps} 
          user={user} 
          opponent={opponent} 
        />
      ) : gameRunning === false ? (
        <StartPage 
          webSocketProps={webSocketProps} 
          user={user} 
        />
      ) : null}
    </div>
  );
}

export default App;