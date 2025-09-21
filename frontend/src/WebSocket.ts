import { useState, useEffect } from "react";
import type { Problem, RunResponse } from "./WebSocketInterfaces.ts";
import type { Opponent } from "./App.tsx";

const blankProblem: Problem = {
  description: "",
  starterCode: "",
};

const blankRunResponse: RunResponse = {
  message: "",
  success: false,
};

export const runningRunResponse: RunResponse = {
  message: "Running...",
  success: false,
};

export interface WebSocketProps {
  isConnected: boolean;
  problem: Problem;
  userCode: string;
  serverRunResponse: RunResponse;
  gameId: string;
  submitCode: () => void;
  setUserCode: (code: string) => void;
  setProblem: (problem: Problem) => void;
  setServerRunResponse: (runResponse: RunResponse) => void;
  setGameId: (gameId: string) => void;
  requestNewGame: () => void;
  syncUserCode: (code: string) => void;
}
export const useWebSocket = (
  connectionLocation: string,
  playerName: string,
  setGameRunning : (gameRunning: boolean) => void,
 opponent: Opponent
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [problem, setProblem] = useState<Problem>(blankProblem);
  const [userCode, setUserCode] = useState<string>("");
  const [serverRunResponse, setServerRunResponse] =
    useState<RunResponse>(blankRunResponse);
  const [gameId, setGameId] = useState("");
  const {
    setOpponentCode,
    setOpponentConsole,
    setOpponentHealth,
    setOpponentLanguage,
    setOpponentName,
  } = opponent;

  //WebSocket management
  useEffect(() => {
    const ws = new WebSocket(connectionLocation);

    ws.onopen = () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      console.log("Message from server:", event.data);
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "problem":
            setProblem(data.data);
            setUserCode(data.data.starterCode);
            break;
          case "result":
            console.log("RESULT", data.data);
            setServerRunResponse(data.data);
            break;
          case "success":
            setGameRunning(true);
            break;
          case "not enough players":
            break;
          case "game full":
            break;
          case "created game":
            setGameId(data.data.id);
            navigator.clipboard.writeText(data.data.id).then(function() {
              console.log('Copied the game id: ' + data.data.id);
            }).catch(function(err) {
              console.error('Error in copying text: ', err);
            });
            break;
          case "opponentCode":
            setOpponentCode(data.data.code);
            break;
          case "opponentConsole":
            setOpponentConsole(data.data.console);
            break;
          case "oppInfo":
            setOpponentName(data.data.name);
            setOpponentLanguage(data.data.language);
            setOpponentHealth(data.data.health);
            break;
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [connectionLocation, gameId, setGameRunning, setOpponentCode, setOpponentConsole]);

  const requestNewGame = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "create", data:{name:playerName} }));
    }
  };

  //Joining a game
  useEffect(() => {
    if (socket && gameId != "") {
      socket.send(JSON.stringify({ type: "join", data: {name:playerName, gameId: gameId } }));
    }
  }, [socket, gameId, playerName]);

  //Leaving a game
  //setGameRunning

  const submitCode = () => {
    if (socket) {
      setServerRunResponse(runningRunResponse);
      socket.send(
        JSON.stringify({ type: "submitUserCode", data: { code: userCode } })
      );
    }
  };

  const syncUserCode = (code: string) => {
    if (socket) {
      socket.send(
        JSON.stringify({ type: "userCode", data: { code: code } })
      );
    }
  };

  return {
    // State
    isConnected,
    problem,
    userCode,
    serverRunResponse,
    gameId,

    // Methods
    submitCode,
    setUserCode,
    setProblem,
    setServerRunResponse,
    setGameId,
    requestNewGame,
    syncUserCode
  };
};
