import React from 'react';
import WebSocket from "./WebSocket";
import * as Page from "./Page/Start";


export function Game() {
  // const [state, setState] = React.useState<Game.State>({ character: [] })
  // WebSocket.useListener((msg) => {

  // })
  return (
    <WebSocket.Provider>
      <Page.Start />
    </WebSocket.Provider>
  )
}
export namespace Game {
 
}
export default Game;