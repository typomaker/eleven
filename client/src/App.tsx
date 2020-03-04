import * as React from 'react';
import CssBaseline from "@material-ui/core/CssBaseline";
import Signin from './Signin';
import Theme from './Theme';
import Configuration from "./Configuration"
import WSocket from "./WSocket";

export default class App extends React.Component {
    public render(): React.ReactNode {
        return (
            <>
                <Theme>
                    <CssBaseline />
                    <Configuration.Provider>
                        <WSocket.Provider>
                            <Signin />
                        </WSocket.Provider>
                    </Configuration.Provider>
                </Theme>
            </>
        );
    }
}