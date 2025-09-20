import { useState } from "react";
import "./App.css";
import GamePage from "./GamePage";
import StartPage from "./StartPage";
import { useWebSocket } from "./WebSocket";

function App() {
  const [gameId, setGameId] = useState("");
  
  // WebSocket management at the app level
  const address = "wss://0813d49b2d9b.ngrok-free.app/ws";
  const webSocketProps = useWebSocket(address);
  
  return (
    <div>
      {gameId ? (
        <GamePage 
          gameId={gameId} 
          setGameId={setGameId} 
          webSocket={webSocketProps}
        />
      ) : (
        <StartPage 
          setGameId={setGameId} 
          webSocket={webSocketProps}
        />
      )}
    </div>
  );
}

export default App;