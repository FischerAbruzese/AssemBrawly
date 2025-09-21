import React from "react";

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  isConnected,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div
        className={`w-4 h-4 rounded-full ${
          isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
        }`}
      ></div>
      <span
        className={`text-sm font-semibold ${
          isConnected ? "text-green-500" : "text-red-500"
        }`}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
};

export default ConnectionStatusIndicator;
