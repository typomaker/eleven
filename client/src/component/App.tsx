import * as React from 'react';
import CssBaseline from "@material-ui/core/CssBaseline";
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