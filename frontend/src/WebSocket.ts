import { useState, useEffect } from "react";
import type { Problem, RunResponse } from "./WebSocketInterfaces.ts";

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
  setGameRunning : (gameRunning: boolean) => void,
  setOpponentCode : (opponentCode: string) => void,
  setOpponentConsole : (opponentConsole: string) => void,
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [problem, setProblem] = useState<Problem>(blankProblem);
  const [userCode, setUserCode] = useState<string>("");
  const [serverRunResponse, setServerRunResponse] =
    useState<RunResponse>(blankRunResponse);
  const [gameId, setGameId] = useState("");

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
            break;
          case "opponentCode":
            console.log("OPPOWNENT CODE", data.data.code);
            setOpponentCode(data.data.code);
            break;
          case "opponentConsole":
            console.log("OPPOWNENT CONSOLE", data.data.console);
            setOpponentConsole(data.data.console);
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
  }, [connectionLocation, setGameRunning, setOpponentCode, setOpponentConsole]);

  const requestNewGame = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "create" }));
    }
  };

  //Joining a game
  useEffect(() => {
    if (socket && gameId != "") {
      socket.send(JSON.stringify({ type: "join", data: { gameId: gameId } }));
    }
  }, [socket, gameId]);

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
