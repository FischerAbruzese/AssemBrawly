import React, { useState, useEffect } from "react";
import { Play, Users, BookOpen, Code, Trophy, Zap, X } from "lucide-react";
import type { Problem, RunResponse } from "./WebSocketInterfaces";
import type { WebSocketProps } from "./WebSocket";

interface StartPageProps {
    webSocketProps: WebSocketProps;
}

const StartPage: React.FC<StartPageProps> = ({webSocketProps}) => {
  const [gameCode, setGameCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const { isConnected, setGameId, requestNewGame } = webSocketProps;

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toastMessage) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        // Clear message after animation completes
        setTimeout(() => setToastMessage(""), 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Function to show a toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message);
  };

  const handleCloseToast = () => {
    setShowToast(false);
    setTimeout(() => setToastMessage(""), 300);
  };

  const handleCreateGame = () => {
    requestNewGame();
    console.log("Creating new game");
    showToastMessage("Creating new game ...");
  };

  const handleJoinGame = () => {
    if (gameCode.trim() && playerName.trim()) {
      setGameId(gameCode.trim());
      console.log(`Joining game ${gameCode} as ${playerName}`);
      showToastMessage(
        `Attempting to join game ${gameCode} as ${playerName} ...`
      );
    }
  };

  const tutorialSteps = [
    {
      icon: <Code className="w-8 h-8 text-blue-500" />,
      title: "Write Code",
      description:
        "Solve coding problems in real-time with Python. Use the built-in editor with syntax highlighting.",
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: "Compete Live",
      description:
        "Race against other programmers. See their progress and submissions in real-time.",
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      title: "Climb Leaderboard",
      description:
        "Earn points for correct solutions and fast completion times. Track your ranking.",
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-500" />,
      title: "Get Instant Feedback",
      description:
        "Run your code and see results immediately. Debug with detailed error messages.",
    },
  ];

  if (showTutorial) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-800">
            Assembrawly Tutorial
          </h1>
          <button
            onClick={() => setShowTutorial(false)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors duration-150"
          >
            Back to Start
          </button>
        </header>

        {/* Tutorial Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                How to Play Assembrawly
              </h2>
              <p className="text-lg text-gray-600">
                Master assembly programming in real-time
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {tutorialSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">{step.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Game Interface
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <BookOpen className="w-12 h-12 text-blue-500 mx-auto" />
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Problem Panel
                  </h4>
                  <p className="text-sm text-gray-600">
                    Read the problem description and understand the requirements
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <Code className="w-12 h-12 text-green-500 mx-auto" />
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Code Editor
                  </h4>
                  <p className="text-sm text-gray-600">
                    Write your solution in the code editor
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <Users className="w-12 h-12 text-purple-500 mx-auto" />
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Live Activity
                  </h4>
                  <p className="text-sm text-gray-600">
                    Compete against other players
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">Assembrawly</h1>

        {/* Connection Status Indicator */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
            }`}
          ></div>
          <span
            className={`text-xs font-medium ${
              isConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">
              Competitive Programming,
              <span className="text-blue-600"> Live</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Race against other programmers in real-time. Solve coding
              challenges, climb the leaderboard, and improve your skills
              together.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Create Game Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-200 flex flex-col">
              <div className="text-center flex-1">
                <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Create Game
                </h3>
                <p className="text-gray-600 mb-6">
                  Start a new competitive session and invite a friend to join
                  your room.
                </p>
              </div>
              <button
                onClick={handleCreateGame}
                disabled={!isConnected}
                className={`
                  w-full px-6 py-3 
                  ${
                    !isConnected
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white font-medium"
                  }
                  rounded transition-colors duration-150`}
              >
                {gameCode ? "Game code: " + gameCode : "Create New Game"}
              </button>
            </div>

            {/* Join Game Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-200 flex flex-col">
              <div className="text-center flex-1">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Join Game
                </h3>
                <div className="space-y-4 mb-6">
                  <input
                    type="text"
                    placeholder="Enter game code"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handleJoinGame}
                disabled={
                  !gameCode.trim() || !playerName.trim() || !isConnected
                }
                className={`
                  w-full px-6 py-3 
                  ${
                    !gameCode.trim() || !playerName.trim() || !isConnected
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  }
                  rounded transition-colors duration-150`}
              >
                Join Game
              </button>
            </div>

            {/* Tutorial Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-200 flex flex-col">
              <div className="text-center flex-1">
                <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Tutorial
                </h3>
                <p className="text-gray-600 mb-6">
                  New to Assembrawly? Learn how to play and master assembly
                  programming.
                </p>
              </div>
              <button
                onClick={() => setShowTutorial(true)}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition-colors duration-150"
              >
                Start Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4">
          <div
            className={`
              max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-lg
              transform transition-all duration-300 ease-in-out
              ${
                showToast
                  ? "translate-y-0 opacity-100"
                  : "translate-y-full opacity-0"
              }
            `}
          >
            <div className="p-4 flex items-center justify-between">
              <p className="text-gray-800 text-sm font-medium pr-4">
                {toastMessage}
              </p>
              <button
                onClick={handleCloseToast}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartPage;
