import { useState } from "react";
import "./App.css";
import GamePage from "./GamePage";
import StartPage from "./StartPage";
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
  const [opponentCode, setOpponentCode] = useState("");
  const [opponentConsole, setOpponentConsole] = useState("");
  const [opponentHealth, setOpponentHealth] = useState(5);
  const [opponentLanguage, setOpponentLanguage] = useState("RISC-V");
  const [opponentName, setOpponentName] = useState("Opponent");
  
  const opponent: Player = {
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
  }
  
  const [userCode, setUserCode] = useState("");
  const [userConsole, setUserConsole] = useState("");
  const [userHealth, setUserHealth] = useState(5);
  const [userLanguage, setUserLanguage] = useState("RISC-V");
  const [userName, setUserName] = useState("");
  
  const user: Player = {
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
  }
 
  // WebSocket management at the app level
  const address = "wss://609c23f26da3.ngrok-free.app/2player";
  const webSocketProps = useWebSocket(address, setGameRunning, user, opponent);
  
  return (
    <div>
      {gameRunning === true ? (
        <GamePage setGameRunning={setGameRunning} webSocketProps={webSocketProps} user={user} opponent={opponent} />
      ) : gameRunning === false ? (
        <StartPage webSocketProps={webSocketProps} user={user} />
      ) : null}
    </div>
  );
}

export default App;