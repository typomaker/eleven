import React, { useContext } from "react"
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Signin from './Signin';
import Game from "./Game";
import Session from "./Session";
export const Router: React.FunctionComponent = () => {
  const [session] = Session.useContext();
  if (!session.id) {
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