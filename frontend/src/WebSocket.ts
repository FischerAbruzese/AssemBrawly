import { useState, useEffect } from "react";

export interface Problem {
  description: string;
  starterCode: string;
}

export interface RunResponse {
  message: string;
  success: boolean;
}

export interface Information {
	message: string;
}

const blankProblem: Problem = {
  description: "",
  starterCode: "",
};

const blankRunResponse: RunResponse = {
  message: "",
  success: false,
};

export const useWebSocket = (connectionLocation: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [problem, setProblem] = useState<Problem>(blankProblem);
  const [userCode, setUserCode] = useState<string>("");
  const [serverRunResponse, setServerRunResponse] = useState<RunResponse>(blankRunResponse);

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
		  case "info":
			console.log("INFO", data.data.information)
			//display info to user
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
  }, [connectionLocation]);

  const submitCode = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "usercode", code: userCode }));
    }
  };

  const sendMessage = (message: "string") => {
    if (socket) {
      socket.send(JSON.stringify(message));
    }
  };

  return {
    // State
    isConnected,
    problem,
    userCode,
    serverRunResponse,
    
    // Methods
    submitCode,
    sendMessage,
    setUserCode,
    setProblem,
    setServerRunResponse,
  };
};
