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
}
export const useWebSocket = (
  connectionLocation: string,
  setGameRunning : (gameRunning: boolean) => void
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
  }, [connectionLocation, setGameRunning]);

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
      socket.send(
        JSON.stringify({ type: "usercode", data: { code: userCode } })
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
  };
};
