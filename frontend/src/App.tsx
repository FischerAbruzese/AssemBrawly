import { useState } from "react";
import "./App.css";
import GamePage from "./GamePage";
import StartPage from "./StartPage";
import { useWebSocket } from "./WebSocket";

export interface Opponent {
  opponentCode: string;
  opponentConsole: string;
  opponentHealth: number;
  opponentLanguage: string;
  opponentName: string;
  setOpponentCode: (opponentCode: string) => void;
  setOpponentConsole: (opponentConsole: string) => void;
  setOpponentHealth: (opponentHealth: number) => void;
  setOpponentLanguage: (opponentLanguage: string) => void;
  setOpponentName: (opponentName: string) => void;
}

function App() {
  const [gameRunning, setGameRunning] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [opponentCode, setOpponentCode] = useState("");
  const [opponentConsole, setOpponentConsole] = useState("");
  const [opponentHealth, setOpponentHealth] = useState(5);
  const [opponentLanguage, setOpponentLanguage] = useState("RISCV");
  const [opponentName, setOpponentName] = useState("Opponent");

  const opponent = {
    opponentCode,
    opponentConsole,
    opponentHealth,
    opponentLanguage,
    opponentName,
    setOpponentCode,
    setOpponentConsole,
    setOpponentHealth,
    setOpponentLanguage,
    setOpponentName
  }
  
  // WebSocket management at the app level
  const address = "wss://609c23f26da3.ngrok-free.app/2player";
  const webSocketProps = useWebSocket(address, playerName, setGameRunning, opponent);

  return (
    <div>
      {gameRunning ? (
        <GamePage setGameRunning={setGameRunning} webSocketProps={webSocketProps} playerName={playerName} opponent={opponent} />
      ) : (
        <StartPage webSocketProps={webSocketProps} playerName={playerName} setPlayerName={setPlayerName} />
      )}
    </div>
  );
}

export default App;
