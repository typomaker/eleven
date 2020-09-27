import * as React from 'react';
import CssBaseline from "@material-ui/core/CssBaseline";
import Theme from './Theme';
import Configuration from "./Configuration"
import WSocket from "./WSocket";
import Session from "./Session";
import Localization from "./Localization";
import Splashscreen from "./Splashscreen";
import Router from "./Router";
import Http from "./Http";

export default class App extends React.Component {
    public render(): React.ReactNode {
        return (
            <>
                <Theme>
                    <CssBaseline />
                    <Localization.Provider>
                        <Http.Provider value={{ host: "https://server." + process.env.DOMAIN! }}>
                            <Configuration.Provider>
                                <WSocket.Provider>
                                    <Session.Provider>
                                        <Splashscreen>
                                            <Router />
                                        </Splashscreen>
                                    </Session.Provider>
                                </WSocket.Provider>
                            </Configuration.Provider>
                        </Http.Provider>
                    </Localization.Provider>
                </Theme>
            </>
        );
    }
}