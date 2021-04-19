import React, { useContext } from "react"
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Signin from './Page/Signin';
import Game from "./Game";
import Session from "./Session";
export const Router: React.FunctionComponent = () => {
  const [session] = Session.useContext();
  if (!session.uuid) {
    return <Signin />
  }
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/signin">
          <Signin />
        </Route>
        <Route path="/">
          <Game />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default Router;