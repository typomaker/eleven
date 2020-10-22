import React from "react";

type Configuration = {
    http: string
    ws: string
}
namespace Configuration {
    export const initial = {
        http: "https://server." + process.env.DOMAIN!,
        ws: "wss://server." + process.env.DOMAIN!
    }
    export const Context = React.createContext<Configuration>(initial);
    Context.displayName = "Configuration";
    export const useContext = () => React.useContext(Context);
    export const Consumer = Context.Consumer;
    export const Provider: React.FunctionComponent = ({ children }) => {
        const [configuration, setConfiguration] = React.useState<Configuration>(initial);
        return (
            <Context.Provider value={configuration}>
                {children}
            </Context.Provider>
        )
    }
}

export default Configuration;