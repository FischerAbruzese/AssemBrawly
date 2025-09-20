import { useState } from "react";
import "./App.css";
import GamePage from "./GamePage";
import StartPage from "./StartPage";
import { useWebSocket } from "./WebSocket";

function App() {
  const [gameRunning, setGameRunning] = useState(false);
  // WebSocket management at the app level
  const address = "wss://609c23f26da3.ngrok-free.app/2player";
  const webSocketProps = useWebSocket(address, setGameRunning);

  return (
    <div>
      {gameRunning ? (
        <GamePage setGameRunning={setGameRunning} webSocketProps={webSocketProps} />
      ) : (
        <StartPage webSocketProps={webSocketProps} />
      )}
    </div>
  );
}

export default App;
