import { useState, useEffect, useRef } from "react";
import type { Problem, RunResponse } from "./WebSocketInterfaces.ts";
import type { Player, GameRunningState } from "./App.tsx";

const blankProblem: Problem = {
  description: "",
  starterCode: "",
};

const blankRunResponse: RunResponse = {
  message: "",
  success: false,
};

export const runningRunResponse: string = "Running...";

export interface WebSocketProps {
  isConnected: boolean;
  problem: Problem;
  gameId: string;
  submitCode: () => void;
  setProblem: (problem: Problem) => void;
  setGameId: (gameId: string) => void;
  requestNewGame: () => void;
}
export const useWebSocket = (
  connectionLocation: string,
  setGameRunning: (gameRunning: GameRunningState) => void,
  user: Player,
  opponent: Player
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [problem, setProblem] = useState<Problem>(blankProblem);
  const [gameId, setGameId] = useState("");

  const {
    playerCode: userCode,
    playerConsole: userConsole,
    playerHealth: userHealth,
    playerLanguage: userLanguage,
    playerName: userName,
    setPlayerCode: setUserCode,
    setPlayerConsole: setUserConsole,
    setPlayerHealth: setUserHealth,
    setPlayerLanguage: setUserLanguage,
    setPlayerName: setUserName,
  } = user;

  const {
    playerHealth: opponentHealth,
    setPlayerCode: setOpponentCode,
    setPlayerConsole: setOpponentConsole,
    setPlayerHealth: setOpponentHealth,
    setPlayerLanguage: setOpponentLanguage,
    setPlayerName: setOpponentName,
  } = opponent;



  const opponentHealthRef = useRef(opponent.playerHealth);
  
  // Update ref whenever opponent health changes
  useEffect(() => {
    opponentHealthRef.current = opponent.playerHealth;
  }, [opponent.playerHealth]);

  // Returns if the game is over
  const decrementOpponentHealth = () => {
    console.log("decrementing opponent health");
    const currentHealth = opponentHealthRef.current;
    if (currentHealth > 0) {
      setOpponentHealth(currentHealth - 1);
      return false;
    }
    return true;
  };

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
            console.log("Problem: ", data.data);
            setProblem(data.data);
            setUserCode(data.data.starterCode);
            setOpponentCode(data.data.starterCode);
            setUserConsole("");
            setOpponentConsole("");
            break;
          case "result":
            console.log("Result: ", data.data);
            setUserConsole(data.data.message);
            if (data.data.success) {
              if (decrementOpponentHealth()){
                setGameRunning(userName);
              }
            }
            break;
          case "success":
            console.log("Success: ", data.data);
            setGameRunning(true);
            break;
          case "not enough players":
            break;
          case "game full":
            break;
          case "created game":
            console.log("Created game: ", data.data);
            setGameId(data.data.id);
            navigator.clipboard
              .writeText(data.data.id)
              .then(function () {
                console.log("Copied the game id: " + data.data.id);
              })
              .catch(function (err) {
                console.error("Error in copying text: ", err);
              });
            break;
          case "opponentCode":
            setOpponentCode(data.data.code);
            break;
          case "oppInfo":
            console.log("Opponent info: ", data.data);
            setOpponentName(data.data.name);
            setOpponentLanguage(data.data.language);
            console.log(data.data.health, "=", opponentHealth);
            setOpponentConsole(data.data.console);
            break;
          case "healthUpdate":
            console.log("Health update: ", data.data);
            setUserHealth(data.data.newHealth);
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
  }, [
    connectionLocation,
    setGameRunning,
    setOpponentCode,
    setOpponentConsole,
    setOpponentHealth,
    setOpponentLanguage,
    setOpponentName,
    setUserCode,
    setUserHealth,
  ]);

  const requestNewGame = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "create", data: { name: userName } }));
    }
  };

  //Joining a game
  useEffect(() => {
    if (socket && gameId != "") {
      socket.send(
        JSON.stringify({
          type: "join",
          data: { name: userName, gameId: gameId },
        })
      );
    }
  }, [socket, gameId, userName]);

  const submitCode = () => {
    if (socket) {
      setUserConsole(runningRunResponse);
      socket.send(
        JSON.stringify({ type: "submitUserCode", data: { code: userCode } })
      );
    }
  };

  //Sync user code
  useEffect(() => {
    if (socket) {
      socket.send(
        JSON.stringify({ type: "userCode", data: { code: userCode } })
      );
    }
  }, [socket, userCode]);

  return {
    // State
    isConnected,
    problem,
    userCode,
    gameId,

    // Methods
    submitCode,
    setProblem,
    setGameId,
    requestNewGame,
  };
};
