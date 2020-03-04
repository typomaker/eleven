import * as React from 'react';
import CssBaseline from "@material-ui/core/CssBaseline";
import Signin from './Signin';
import Theme from './Theme';
import Configuration from "./Configuration"

export default class App extends React.Component {
    public render(): React.ReactNode {
        return (
            <>
                <Theme>
                    <CssBaseline />
                    <Configuration.Provider language={navigator.language} domain={process.env.DOMAIN}>
                        <Signin />
                    </Configuration.Provider>
                </Theme>
            </>
        );
    }
}