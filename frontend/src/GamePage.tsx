import React, { useState, useEffect, useCallback } from "react";
import { Play, Menu, Heart } from "lucide-react";
import type { WebSocketProps } from "./WebSocket";
import { runningRunResponse } from "./WebSocket";
import ConnectionStatusIndicator from "./ConnectionStatusIndicator";
import type { Player, GameRunningState } from "./App";
import RiscVCheatSheet from "./RiscVCheatSheet";
import { useConsoleFlash, useHealthFlash, useProblemFlash } from "./flashHooks";

interface GamePageProps {
  setGameRunning: (gameRunning: GameRunningState) => void;
  webSocketProps: WebSocketProps;
  user: Player;
  opponent: Player;
}

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  direction: "horizontal" | "vertical";
  className?: string;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onResize,
  direction,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      const startPos = direction === "horizontal" ? e.clientX : e.clientY;

      const handleMouseMove = (e: MouseEvent) => {
        const currentPos = direction === "horizontal" ? e.clientX : e.clientY;
        const delta = currentPos - startPos;
        onResize(delta);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [direction, onResize]
  );

  return (
    <div
      className={`${
        direction === "horizontal"
          ? "w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-500"
          : "h-1 cursor-row-resize hover:bg-blue-400 active:bg-blue-500"
      } bg-gray-600 transition-colors duration-150 select-none ${
        isDragging ? "bg-blue-500" : ""
      } ${className}`}
      onMouseDown={handleMouseDown}
    />
  );
};

const GamePage: React.FC<GamePageProps> = ({
  setGameRunning,
  webSocketProps,
  user,
  opponent,
}) => {
  const { isConnected, problem, gameId, submitCode, syncCode } = webSocketProps;

  const {
    playerCode: opponentCode,
    playerConsole: opponentConsole,
    playerHealth: opponentHealth,
    playerLanguage: opponentLanguage,
    playerName: opponentName,
  } = opponent;

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

  // Layout state
  const [leftPanelWidth, setLeftPanelWidth] = useState(30); // percentage
  const [centerPanelWidth, setCenterPanelWidth] = useState(40); // percentage
  const [leftCodeHeight, setLeftCodeHeight] = useState(60); // percentage of left panel
  const [centerProblemHeight, setCenterProblemHeight] = useState(50); // percentage of center panel
  const [rightCodeHeight, setRightCodeHeight] = useState(60); // percentage of right panel

  // Flash hooks
  const { flashClasses: userConsoleFlashClasses } = useConsoleFlash(userConsole);
  const { flashClasses: opponentConsoleFlashClasses } = useConsoleFlash(opponentConsole);
  const { flashClasses: userHealthFlashClasses } = useHealthFlash(userHealth);
  const { flashClasses: opponentHealthFlashClasses } = useHealthFlash(opponentHealth);
  const { flashClasses: problemFlashClasses } = useProblemFlash(problem.description);

  const maxHearts = 5;

  // Running state
  const isRunning = () => userConsole === runningRunResponse;

  // Resize handlers
  const handleLeftCenterResize = useCallback(
    (delta: number) => {
      const newLeftWidth = Math.max(
        20,
        Math.min(60, leftPanelWidth + (delta / window.innerWidth) * 100)
      );
      setLeftPanelWidth(newLeftWidth);
    },
    [leftPanelWidth]
  );

  const handleCenterRightResize = useCallback(
    (delta: number) => {
      const newCenterWidth = Math.max(
        20,
        Math.min(60, centerPanelWidth + (delta / window.innerWidth) * 100)
      );
      setCenterPanelWidth(newCenterWidth);
    },
    [centerPanelWidth]
  );

  const handleLeftVerticalResize = useCallback(
    (delta: number) => {
      const leftPanel = document.querySelector(
        "[data-left-panel]"
      ) as HTMLElement;
      if (!leftPanel) return;

      const newHeight = Math.max(
        20,
        Math.min(80, leftCodeHeight + (delta / leftPanel.clientHeight) * 100)
      );
      setLeftCodeHeight(newHeight);
    },
    [leftCodeHeight]
  );

  const handleCenterVerticalResize = useCallback(
    (delta: number) => {
      const centerPanel = document.querySelector(
        "[data-center-panel]"
      ) as HTMLElement;
      if (!centerPanel) return;

      const newHeight = Math.max(
        20,
        Math.min(
          80,
          centerProblemHeight + (delta / centerPanel.clientHeight) * 100
        )
      );
      setCenterProblemHeight(newHeight);
    },
    [centerProblemHeight]
  );

  const handleRightVerticalResize = useCallback(
    (delta: number) => {
      const rightPanel = document.querySelector(
        "[data-right-panel]"
      ) as HTMLElement;
      if (!rightPanel) return;

      const newHeight = Math.max(
        20,
        Math.min(80, rightCodeHeight + (delta / rightPanel.clientHeight) * 100)
      );
      setRightCodeHeight(newHeight);
    },
    [rightCodeHeight]
  );

  const rightPanelWidth = 100 - leftPanelWidth - centerPanelWidth;
  const leftConsoleHeight = 100 - leftCodeHeight;
  const centerCheatsheetHeight = 100 - centerProblemHeight;
  const rightConsoleHeight = 100 - rightCodeHeight;

  const handleBackToStart = () => {
    setGameRunning(false);
  };

  // Vertical heart column component with flash support
  const HeartColumn: React.FC<{ side: "left" | "right" }> = ({ side }) => {
    const heartsToDisplay = side === "left" ? userHealth : opponentHealth;
    const heartsToHide = maxHearts - heartsToDisplay;
    const flashClasses = side === "left" ? userHealthFlashClasses : opponentHealthFlashClasses;

    return (
      <div
        className={`flex flex-col justify-center items-center py-4 bg-gray-750 ${
          side === "left" ? "border-r" : "border-l"
        } border-gray-600 ${flashClasses}`}
        style={{ minWidth: "32px" }}
      >
        {Array.from({ length: heartsToDisplay }, (_, i) => (
          <Heart key={i} className="w-4 h-4 text-red-500 fill-red-500 my-1" />
        ))}
        {Array.from({ length: heartsToHide }, (_, i) => (
          <Heart
            key={i + heartsToDisplay}
            className="w-4 h-4 text-gray-800 fill-gray-800 my-1"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-600 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToStart}
            className="text-gray-300 hover:text-white transition-colors duration-150"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-100">
            Assembrawly {gameId && `- Game: ${gameId}`}
          </h1>
        </div>

        <ConnectionStatusIndicator isConnected={isConnected} />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Code & Console */}
        <div
          className="flex flex-col bg-gray-800 border-r border-gray-600 min-h-0"
          style={{ width: `${leftPanelWidth}%` }}
          data-left-panel
        >
          {/* Code Editor */}
          <div
            className="flex flex-col overflow-hidden min-h-0"
            style={{ height: `${leftCodeHeight}%` }}
          >
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-200">
                {userName + "'s Code"}
              </h3>
              <select className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-200">
                <option>RISC-V</option>
              </select>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
              <textarea
                value={userCode}
                onChange={(e) => {
                  setUserCode(e.target.value);
                  syncCode(e.target.value);
                }}
                className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-green-400 resize-none outline-none border-0"
                style={{
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  lineHeight: "1.5",
                }}
                spellCheck={false}
              />
            </div>
          </div>

          <ResizeHandle
            onResize={handleLeftVerticalResize}
            direction="vertical"
            className="flex-shrink-0"
          />

          {/* Console */}
          <div
            className="flex flex-col overflow-hidden min-h-0"
            style={{ height: `${leftConsoleHeight}%` }}
          >
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-200">
                Console - Left
              </h3>
              <button
                onClick={() => {
                  submitCode();
                }}
                disabled={isRunning()}
                className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors duration-150"
              >
                <Play className="w-3 h-3" />
                <span>{isRunning() ? "Running..." : "Run Code"}</span>
              </button>
            </div>
            <div className={`flex-1 overflow-y-auto p-4 min-h-0 ${userConsoleFlashClasses}`}>
              <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
                {userConsole}
              </pre>
            </div>
          </div>
        </div>

        <ResizeHandle
          onResize={handleLeftCenterResize}
          direction="horizontal"
          className="flex-shrink-0"
        />

        {/* Center Panel - Problem & Cheatsheet */}
        <div
          className="flex flex-col bg-gray-800 border-r border-gray-600 min-h-0"
          style={{ width: `${centerPanelWidth}%` }}
          data-center-panel
        >
          {/* Problem Description with Hearts */}
          <div
            className="flex overflow-hidden min-h-0"
            style={{ height: `${centerProblemHeight}%` }}
          >
            {/* Left Hearts */}
            <HeartColumn side="left" />

            {/* Problem Content */}
            <div className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-200">Problem</h3>
              </div>
              <div className={`flex-1 overflow-y-auto p-4 text-sm min-h-0 ${problemFlashClasses}`}>
                <p className="mb-4 text-gray-300">{problem.description}</p>
              </div>
            </div>

            {/* Right Hearts */}
            <HeartColumn side="right" />
          </div>

          <ResizeHandle
            onResize={handleCenterVerticalResize}
            direction="vertical"
            className="flex-shrink-0"
          />

          {/* RiscV Assembly Cheatsheet */}
          <div
            className="flex flex-col overflow-hidden min-h-0"
            style={{ height: `${centerCheatsheetHeight}%` }}
          >
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-200">
                RISC-V Assembly Cheatsheet
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-gray-800">
              <RiscVCheatSheet />
            </div>
          </div>
        </div>

        <ResizeHandle
          onResize={handleCenterRightResize}
          direction="horizontal"
          className="flex-shrink-0"
        />

        {/* Right Panel - Code & Console (Clone) */}
        <div
          className="flex flex-col bg-gray-800 overflow-hidden min-h-0"
          style={{ width: `${rightPanelWidth}%` }}
          data-right-panel
        >
          {/* Code Editor */}
          <div
            className="flex flex-col overflow-hidden min-h-0"
            style={{ height: `${rightCodeHeight}%` }}
          >
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-200">
                {opponentName + "'s Code"}
              </h3>
              <select
                className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-200"
                disabled
              >
                <option>{opponentLanguage}</option>
              </select>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
              <textarea
                value={opponentCode}
                className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-green-400 resize-none outline-none border-0"
                style={{
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  lineHeight: "1.5",
                }}
                spellCheck={false}
                readOnly
              />
            </div>
          </div>

          <ResizeHandle
            onResize={handleRightVerticalResize}
            direction="vertical"
            className="flex-shrink-0"
          />

          {/* Console */}
          <div
            className="flex flex-col overflow-hidden min-h-0"
            style={{ height: `${rightConsoleHeight}%` }}
          >
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-200">
                Console - Right
              </h3>
            </div>
            <div className={`flex-1 overflow-y-auto p-4 min-h-0 ${opponentConsoleFlashClasses}`}>
              <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
                {opponentConsole}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;