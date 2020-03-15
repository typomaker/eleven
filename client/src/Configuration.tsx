import React, { useState } from "react";

interface Configuration {
    domain: string
    set: (value: Omit<Configuration, "set">) => void
}

namespace Configuration {
    const initial = {
        domain: process.env.DOMAIN!,
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