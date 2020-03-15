import * as React from 'react';
import CssBaseline from "@material-ui/core/CssBaseline";
import Theme from './Theme';
import Configuration from "./Configuration"
import WSocket from "./WSocket";
import Session from "./Session";
import Localization from "./Localization";
import Splashscreen from "./Splashscreen";
import Router from "./Router";

export default class App extends React.Component {
    public render(): React.ReactNode {
        return (
            <>
                <Theme>
                    <CssBaseline />
                    <Localization.Provider>
                        <Configuration.Provider>
                            <WSocket.Provider>
                                <Session.Provider>
                                    <Session.Account.Provider>
                                        <Splashscreen>
                                            <Router />
                                        </Splashscreen>
                                    </Session.Account.Provider>
                                </Session.Provider>
                            </WSocket.Provider>
                        </Configuration.Provider>
                    </Localization.Provider>
                </Theme>
            </>
        );
    }
}