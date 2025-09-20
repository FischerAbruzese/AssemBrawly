import React, { useState, useCallback } from "react";
import { Play, Menu } from "lucide-react";
import { useWebSocket } from "./WebSocket";

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

const GamePage: React.FC = () => {
  const address = "wss://0813d49b2d9b.ngrok-free.app/ws";

  //Websocket
  const {
    isConnected,
    problem,
    userCode,
    serverRunResponse,
    submitCode,
    setUserCode,
  } = useWebSocket(address);

  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [topHeight, setTopHeight] = useState(40); // percentage of left panel
  const [middleHeight, setMiddleHeight] = useState(45); // percentage of left panel
  const [isRunning, setIsRunning] = useState(false);

  const handleHorizontalResize = useCallback(
    (delta: number) => {
      const newWidth = Math.max(
        20,
        Math.min(80, leftWidth + (delta / window.innerWidth) * 100)
      );
      setLeftWidth(newWidth);
    },
    [leftWidth]
  );

  const handleTopResize = useCallback(
    (delta: number) => {
      const leftPanel = document.querySelector(
        "[data-left-panel]"
      ) as HTMLElement;
      if (!leftPanel) return;

      const newHeight = Math.max(
        20,
        Math.min(60, topHeight + (delta / leftPanel.clientHeight) * 100)
      );
      setTopHeight(newHeight);
      setMiddleHeight(Math.max(20, Math.min(60, 100 - newHeight - 15))); // 15% for bottom panel minimum
    },
    [topHeight]
  );

  const handleMiddleResize = useCallback(
    (delta: number) => {
      const leftPanel = document.querySelector(
        "[data-left-panel]"
      ) as HTMLElement;
      if (!leftPanel) return;

      const newMiddleHeight = Math.max(
        20,
        Math.min(60, middleHeight + (delta / leftPanel.clientHeight) * 100)
      );
      setMiddleHeight(newMiddleHeight);
    },
    [middleHeight]
  );

  const bottomHeight = 100 - topHeight - middleHeight;

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-600 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Menu className="w-5 h-5 text-gray-300" />
          <h1 className="text-xl font-semibold text-gray-100">CodeFight</h1>

        {/* Connection Status Indicator - moved to right */}
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
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel */}
        <div
          className="flex flex-col bg-gray-800 border-r border-gray-600 min-h-0"
          style={{ width: `${leftWidth}%` }}
          data-left-panel
        >
          {/* Problem Description */}
          <div
            className="flex flex-col overflow-hidden min-h-0"
            style={{ height: `${topHeight}%` }}
          >
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-200">Problem</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm min-h-0">
              <p className="mb-4 text-gray-300">{problem.description}</p>
            </div>
          </div>

          <ResizeHandle
            onResize={handleTopResize}
            direction="vertical"
            className="flex-shrink-0"
          />

          {/* Code Editor */}
          <div
            className="flex flex-col overflow-hidden min-h-0"
            style={{ height: `${middleHeight}%` }}
          >
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-200">Code</h3>
              <select className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-200">
                <option>Python</option>
              </select>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
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
            onResize={handleMiddleResize}
            direction="vertical"
            className="flex-shrink-0"
          />

          {/* Results Panel */}
          <div
            className="flex flex-col overflow-hidden min-h-0"
            style={{ height: `${bottomHeight}%` }}
          >
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-200">Console</h3>
              <button
                onClick={() => {
                  setIsRunning(true);
                  submitCode();
                }}
                disabled={isRunning}
                className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors duration-150"
              >
                <Play className="w-3 h-3" />
                <span>{isRunning ? "Running..." : "Run Code"}</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-800 min-h-0">
              <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
                {serverRunResponse.success
                  ? "SUCCESS"
                  : serverRunResponse.message}
              </pre>
            </div>
          </div>
        </div>

        <ResizeHandle
          onResize={handleHorizontalResize}
          direction="horizontal"
          className="flex-shrink-0"
        />

        {/* Right Panel - Multiplayer/Activity Feed */}
        <div
          className="flex flex-col bg-gray-800 overflow-hidden min-h-0"
          style={{ width: `${100 - leftWidth}%` }}
        >
          <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex-shrink-0">
            <h3 className="text-sm font-medium text-gray-200">Live Activity</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-900/50 rounded-lg border border-blue-800/50">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  JD
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-200">
                      john_doe
                    </span>
                    <span className="text-xs text-green-400">● online</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Working on Two Sum - submitted 2 attempts
                  </p>
                  <span className="text-xs text-gray-500">2 minutes ago</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-green-900/50 rounded-lg border border-green-800/50">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  AS
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-200">
                      alice_smith
                    </span>
                    <span className="text-xs text-green-400">● online</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    ✅ Solved Two Sum in 3:24
                  </p>
                  <span className="text-xs text-gray-500">5 minutes ago</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-yellow-900/50 rounded-lg border border-yellow-800/50">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  MJ
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-200">
                      mike_jones
                    </span>
                    <span className="text-xs text-gray-500">● 10m ago</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Started working on Add Two Numbers
                  </p>
                  <span className="text-xs text-gray-500">12 minutes ago</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-purple-900/50 rounded-lg border border-purple-800/50">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  SR
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-200">
                      sarah_rodriguez
                    </span>
                    <span className="text-xs text-green-400">● online</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Currently debugging solution...
                  </p>
                  <span className="text-xs text-gray-500">Just now</span>
                </div>
              </div>

              <div className="border-t border-gray-600 pt-4 mt-6">
                <h4 className="text-sm font-medium text-gray-200 mb-3">
                  Leaderboard
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-yellow-900/30 border border-yellow-800/50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-yellow-400">
                        🥇
                      </span>
                      <span className="text-sm text-gray-200">alice_smith</span>
                    </div>
                    <span className="text-xs text-gray-400">15 solved</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-700 border border-gray-600 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-400">
                        🥈
                      </span>
                      <span className="text-sm text-gray-200">john_doe</span>
                    </div>
                    <span className="text-xs text-gray-400">12 solved</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-900/30 border border-orange-800/50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-orange-400">
                        🥉
                      </span>
                      <span className="text-sm text-gray-200">mike_jones</span>
                    </div>
                    <span className="text-xs text-gray-400">8 solved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
