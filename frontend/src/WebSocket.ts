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
  problem: Problem;
  gameId: string;
  isConnected: boolean;
  submitCode: () => void;
  syncCode: (code: string) => void;
  setProblem: (problem: Problem) => void;
  setGameId: (gameId: string) => void;
  joinGame: (gId: string) => void;
}
export const useWebSocket = (
  connectionLocation: string,
  setGameRunning: (gameRunning: GameRunningState) => void,
  user: Player,
  opponent: Player
) => {
  const socket = useRef<WebSocket | null>(null);
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

  const isConnected = socket.current !== null && socket.current.readyState === WebSocket.OPEN;

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
    }
  };

  const makeSocket = (address: string) => {
    const ws = new WebSocket(address);

    ws.onopen = () => {
      console.log("Connected to WebSocket: ", address);
      socket.current = ws;
    };

    ws.onmessage = (event) => {
      console.log("Message from server:", event);
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
              decrementOpponentHealth();
            }
            break;
          case "starting":
            console.log("Starting");
            console.log("Sending username: ", userName);
            if (socket.current !== null){
              socket.current.send(
              JSON.stringify({
                type: "name",
                data: { name: userName },
              })
            )}
            else{
              console.log("Failed to send name", socket)
            }
            setGameRunning(true);
            break;
          case "join_status": //Only triggers on failures
            const status: string = data.data.status;
            console.log("Join status: ", status);
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
          case "gameOver":
            console.log("Game over: ", data.data.winner);
            setGameRunning(data.data.winner);
            setGameId("");
            setProblem(blankProblem);
            break;
          case "info":
            console.log("Info: ", data.data.message);
            break;
        }
      } catch (error) {
        // setGameRunning(true);//TODO REMOVE
        console.error("Error parsing JSON:", error, "Data:", event.data);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
      socket.current = null;
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return ws;
  }

  const joinGame = (gId: string) => {
    const gameLocation = connectionLocation + "/ws/" + gId;
    console.log("Attempting to connect to websocket: ", gameLocation);
    makeSocket(gameLocation)
  };

  const submitCode = () => {
    if (socket.current) {
      setUserConsole(runningRunResponse);
      socket.current.send(
        JSON.stringify({ type: "submitUserCode", data: { code: userCode } })
      );
    }
  };

  //Sync user code
  const syncCode = (code: string) => {
    if (socket.current) {
      socket.current.send(
        JSON.stringify({ type: "userCode", data: { code: code } })
      );
    }
  };

  return {
    // State
    problem,
    userCode,
    gameId,

    // Methods
    isConnected,
    joinGame,
    submitCode,
    syncCode,
    setProblem,
    setGameId,
  };
};
