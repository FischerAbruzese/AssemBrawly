import { useState } from "react";
import "./App.css";
import GamePage from "./GamePage";
import StartPage from "./StartPage";
import { useWebSocket } from "./WebSocket";

function App() {
  const [gameRunning, setGameRunning] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [opponentCode, setOpponentCode] = useState("");
  const [opponentConsole, setOpponentConsole] = useState("");
  
  // WebSocket management at the app level
  const address = "wss://609c23f26da3.ngrok-free.app/2player";
  const webSocketProps = useWebSocket(address, setGameRunning, setOpponentCode, setOpponentConsole);

  return (
    <div>
      {gameRunning ? (
        <GamePage setGameRunning={setGameRunning} webSocketProps={webSocketProps} playerName={playerName} opponentCode={opponentCode} opponentConsole={opponentConsole}/>
      ) : (
        <StartPage webSocketProps={webSocketProps} playerName={playerName} setPlayerName={setPlayerName} />
      )}
    </div>
  );
}

export default App;
