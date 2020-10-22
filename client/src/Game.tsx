import React from 'react';
import WebSocket from "./WebSocket";
import Start from "./Start";
export const Game: React.FunctionComponent = () => {
  return (
    <WebSocket.Provider>
      <Start />
    </WebSocket.Provider>
  )
}

export default Game;