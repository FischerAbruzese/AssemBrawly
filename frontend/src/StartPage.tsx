import React, { useState, useEffect } from "react";
import {
  Play,
  Users,
  BookOpen,
  Code,
  Trophy,
  Zap,
  X,
  Sparkles,
} from "lucide-react";
import type { WebSocketProps } from "./WebSocket";
import ConnectionStatusIndicator from "./ConnectionStatusIndicator";
import FloatingAssemblySymbols from "./FloatingAssemblySymbols";
import type { Player } from "./App";

interface StartPageProps {
  webSocketProps: WebSocketProps;
  user: Player;
}

const StartPage: React.FC<StartPageProps> = ({
  webSocketProps,
  user,
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [currTypingGameId, setCurrTypingGameId] = useState("");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const { isConnected, gameId, setGameId, joinGame } = webSocketProps;

  const {
    playerCode: userCode,
    playerConsole: userConsole,
    playerHealth: userHealth,
    playerLanguage: userLanguage,
    playerName: userName,
    setPlayerCode: setUserCode,
    setPlayerConsole: setUserConsole,
    setPlayerHealth: setUserHealth,
    setPlayerLanguage: setPlayerLanguage,
    setPlayerName: setUserName,
  } = user;

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

  // const handleCreateGame = async () => {
  // requestNewGame();
  // console.log("Creating new game ...");

  // if (gameId) {
  //   try {
  //     await navigator.clipboard.writeText(gameId);
  //     console.log('Copied the game id: ' + gameId);
  //     showToastMessage(
  //       "Game code copied to clipboard! Share it with a friend to start a game!"
  //     );
  //   } catch (err) {
  //     console.error('Error in copying text: ', err);
  //   }
  // }
// };


  const handleJoinGame = () => {
    if (currTypingGameId.trim() && userName.trim()) {
      setGameId(currTypingGameId.trim());
      joinGame(currTypingGameId.trim());
      console.log(`Joining game ${currTypingGameId} as ${userName}`);
      showToastMessage(
        `Attempting to join game ${currTypingGameId} as ${userName} ...`
      );
    }
  };

  const toggleAnimations = () => {
    setAnimationsEnabled(!animationsEnabled);
    showToastMessage(
      `Animations ${animationsEnabled ? "disabled" : "enabled"}`
    );
  };

  // Get tooltip message for Create Game button
  // const getCreateGameTooltip = () => {
  //   if (!isConnected) return "Connect to server to create a game";
  //   if (!userName.trim()) return "Enter your name to create a game";
  //   return null;
  // };

  // Get tooltip message for Join Game button
  const getJoinGameTooltip = () => {
    // if (!isConnected) return "Connect to server to join a game";
    if (!userName.trim()) return "Enter your name to join a game";
    if (!currTypingGameId.trim()) return "Enter a game code to join";
    return null;
  };

  const tutorialSteps = [
    {
      icon: <Code className="w-8 h-8 text-blue-400" />,
      title: "Write Code",
      description:
        "Solve coding problems in real-time with Python. Use the built-in editor with syntax highlighting.",
    },
    {
      icon: <Users className="w-8 h-8 text-green-400" />,
      title: "Compete Live",
      description:
        "Race against other programmers. See their progress and submissions in real-time.",
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-400" />,
      title: "Climb Leaderboard",
      description:
        "Earn points for correct solutions and fast completion times. Track your ranking.",
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-400" />,
      title: "Get Instant Feedback",
      description:
        "Run your code and see results immediately. Debug with detailed error messages.",
    },
  ];

  if (showTutorial) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col overflow-hidden">
        {/* Floating Symbols Background */}
        {animationsEnabled && <FloatingAssemblySymbols />}

        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-600 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0 relative z-10">
          <div className="flex items-center justify-center">
            <img
              src="/x86.svg"
              alt="X86 Assembly Language"
              className="w-12 h-12 cursor-pointer"
              onClick={() => setShowTutorial(false)}
            />
          </div>
          <h1 className="text-xl font-semibold text-gray-100">
            Assembrawly Tutorial
          </h1>
          <button
            onClick={() => setShowTutorial(false)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 text-sm rounded transition-colors duration-150"
          >
            Back to Start
          </button>
        </header>

        {/* Tutorial Content */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-100 mb-4">
                How to Play Assembrawly
              </h2>
              <p className="text-lg text-gray-300">
                Master assembly programming in real-time
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {tutorialSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-600"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">{step.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-100">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-600 p-8">
              <h3 className="text-2xl font-semibold text-gray-100 mb-6">
                Game Interface
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <BookOpen className="w-12 h-12 text-blue-400 mx-auto" />
                  </div>
                  <h4 className="font-medium text-gray-100 mb-2">
                    Problem Panel
                  </h4>
                  <p className="text-sm text-gray-300">
                    Read the problem description and understand the requirements
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <Code className="w-12 h-12 text-green-400 mx-auto" />
                  </div>
                  <h4 className="font-medium text-gray-100 mb-2">
                    Code Editor
                  </h4>
                  <p className="text-sm text-gray-300">
                    Write your solution in the code editor
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <Users className="w-12 h-12 text-purple-400 mx-auto" />
                  </div>
                  <h4 className="font-medium text-gray-100 mb-2">
                    Live Activity
                  </h4>
                  <p className="text-sm text-gray-300">
                    Compete against other players
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animation Toggle Button */}
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={toggleAnimations}
            className={`
              p-3 rounded-full shadow-lg border transition-all duration-200
              ${
                animationsEnabled
                  ? "bg-purple-600 hover:bg-purple-700 border-purple-500 text-white"
                  : "bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300"
              }
            `}
            title={
              animationsEnabled ? "Disable animations" : "Enable animations"
            }
          >
            <Sparkles
              className={`w-5 h-5 ${animationsEnabled ? "animate-pulse" : ""}`}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col overflow-hidden">
      {/* Floating Symbols Background */}
      {animationsEnabled && <FloatingAssemblySymbols />}

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-600 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0 relative z-10">
        <div className="flex items-center justify-center">
          <img
            src="/x86.svg"
            alt="X86 Assembly Language"
            className="w-12 h-12 cursor-pointer"
            onClick={() => setShowTutorial(false)}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-100">Assembrawly</h1>
        <ConnectionStatusIndicator isConnected={isConnected} />
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            {/* <h2 className="text-5xl font-bold text-gray-100 mb-6">
              Competitive Programming,
              <span className="text-blue-400"> Live</span>
            </h2> */}
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Race against another programmer in real-time to solve assembly
              questions as fast as you can!
            </p>
          </div>

          {/* Player Name Section */}
          <div className="mb-8">
            <div className="max-w-md mx-auto font-bold text-lg">
              <input
                id="playerName"
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-gray-700 text-gray-100 placeholder-gray-400 text-center"
              />
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Create Game Card */}
            
            {/* <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-600 p-8 hover:shadow-md transition-shadow duration-200 flex flex-col">
              <div className="text-center flex-1">
                <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-4">
                  Create Game
                </h3>
                <p className="text-gray-300 mb-6">
                  Start a new game and invite a friend to join your room.
                </p>
              </div>
              <div
                className="relative"
                onMouseEnter={() => setTooltipVisible("create")}
                onMouseLeave={() => setTooltipVisible(null)}
              >
                <button
                  onClick={handleCreateGame}
                  disabled={!isConnected || !userName.trim()}
                  className={`
                    w-full px-6 py-3 
                    ${
                      !isConnected || !userName.trim()
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white font-medium"
                    }
                    rounded transition-colors duration-150`}
                >
                  {gameId ? "Game code: " + gameId : "Create New Game"}
                </button>

                /* Create Game Tooltip 
                {tooltipVisible === "create" && getCreateGameTooltip() && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                    <div className="bg-gray-700 text-gray-100 text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                      {getCreateGameTooltip()}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-700"></div>
                    </div>
                  </div>
                )}
              </div>
            </div> */}
            

            {/* Join Game Card */}
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-600 p-8 hover:shadow-md transition-shadow duration-200 flex flex-col">
              <div className="text-center flex-1">
                <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-4">
                  Join Game
                </h3>
                <p className="text-gray-300 mb-6">
                  Ask a friend to start a game!
                </p>
                <div className="space-y-4 mb-6">
                  <input
                    type="text"
                    placeholder="Enter game code"
                    value={currTypingGameId}
                    onChange={(e) => setCurrTypingGameId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-600 rounded text-sm text-center focus:outline-none focus:border-blue-500 bg-gray-700 text-gray-100 placeholder-gray-400"
                  />
                </div>
              </div>
              <div
                className="relative"
                onMouseEnter={() => setTooltipVisible("join")}
                onMouseLeave={() => setTooltipVisible(null)}
              >
                <button
                  onClick={handleJoinGame}
                  disabled={
                    !currTypingGameId.trim() ||
                    !userName.trim()
                  }
                  className={`
                    w-full px-6 py-3 
                    ${
                      !currTypingGameId.trim() ||
                      !userName.trim()
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    }
                    rounded transition-colors duration-150`}
                >
                  Join Game
                </button>

                {/* Join Game Tooltip */}
                {tooltipVisible === "join" && getJoinGameTooltip() && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                    <div className="bg-gray-700 text-gray-100 text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                      {getJoinGameTooltip()}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-700"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tutorial Card */}
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-600 p-8 hover:shadow-md transition-shadow duration-200 flex flex-col">
              <div className="text-center flex-1">
                <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-4">
                  Tutorial
                </h3>
                <p className="text-gray-300 mb-6">
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

      {/* Animation Toggle Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={toggleAnimations}
          className={`
            p-3 rounded-full shadow-lg border transition-all duration-200
            ${
              animationsEnabled
                ? "bg-purple-600 hover:bg-purple-700 border-purple-500 text-white"
                : "bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300"
            }
          `}
          title={animationsEnabled ? "Disable animations" : "Enable animations"}
        >
          <Sparkles
            className={`w-5 h-5 ${animationsEnabled ? "animate-pulse" : ""}`}
          />
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center p-4">
          <div
            className={`
        max-w-md w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${
          showToast ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }
      `}
          >
            <div className="p-4 flex items-center justify-between">
              <p className="text-gray-100 text-sm font-medium pr-4">
                {toastMessage}
              </p>
              <button
                onClick={handleCloseToast}
                className="text-gray-400 hover:text-gray-300 transition-colors duration-150"
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
