import * as React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import CssBaseline from "@material-ui/core/CssBaseline";
import Configuration from "./Configuration";
import Signin from './Signin';
import Theme from './Theme';

export default class App extends React.Component {
    render(): React.ReactNode {
        return (
            <>
                <Theme>
                    <CssBaseline />
                    <Signin />
                </Theme>
            </>
        );
    }
}