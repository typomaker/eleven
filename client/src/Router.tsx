import React, { useContext } from "react"
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Signin from './Signin';
import Start from "./Start";
import Session from "./Session";
export const Router: React.FunctionComponent = () => {
  const session = useContext(Session.Context);
  if (!session.value.user) {
    return <Signin />
  }
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/signin">
          <Signin />
        </Route>
        <Route path="/">
          <Start />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default Router;