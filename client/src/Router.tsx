import React, { useContext } from "react"
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Signin from './Signin';
import Home from "./Home";
import Session from "./Session";
export const Router: React.FunctionComponent = () => {
  const account = useContext(Session.Account.Context);

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/signin">
          {account ? <Redirect to="/" /> : <Signin />}
        </Route>
        <Route path="/">
          {account ? <Home /> : <Redirect to="/signin" />}
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default Router;