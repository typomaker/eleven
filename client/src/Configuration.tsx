import React, { useState } from "react";

interface Configuration {
    readonly http: string
    readonly ws: string
    set: (value: Omit<Configuration, "set">) => void
}

namespace Configuration {
    const initial = {
        http: "https://server." + process.env.DOMAIN!,
        ws: "wss://server." + process.env.DOMAIN!,
        set: () => { }
    }
    export const Context = React.createContext<Configuration>(initial);
    Context.displayName = "Configuration";

    export const Consumer = Context.Consumer;
    export const Provider: React.FunctionComponent = ({ children }) => {
        const [value, setValue] = useState<Configuration>({
            ...initial,
            set: (v) => setValue({ ...value, ...v })
        });

        return (
            <Context.Provider value={value}>
                {children}
            </Context.Provider>
        )
    }
}

export default Configuration;