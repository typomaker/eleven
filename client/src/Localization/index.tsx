import React, { useState, useEffect } from "react";
import Dictionary from "./Dictionary";
import en from "./translate/en";

interface Localization {
    ready: boolean,
    current: keyof Localization["languages"],
    languages: Record<"ru" | "en", { title: string }>
    set: (value: keyof Localization["languages"]) => void,
    t: Dictionary
}

namespace Localization {
    const language = navigator?.language?.split("-")[0]
    const languages = {
        "ru": { title: "Русский" },
        "en": { title: "English" },
    }
    function isSupported(v: string): v is keyof Localization['languages'] {
        return languages.hasOwnProperty(v);
    }
    const initial: Localization = {
        current: isSupported(language) ? language : "en",
        ready: false,
        languages,
        set: () => { },
        t: en
    }

    async function load(v: keyof Localization['languages']): Promise<Dictionary> {
        return import("./translate/" + v).then(v => v.default);
    }
    export const Context = React.createContext<Localization>(initial);
    Context.displayName = "Language";

    export const Consumer = Context.Consumer;
    export const Provider: React.FunctionComponent = ({ children }) => {
        const [value, setValue] = useState<Localization>({
            ...initial,
            set: (selected: keyof Localization["languages"]) => {
                setValue({ ...value, current: selected })
            }
        });
        useEffect(() => {
            setValue({ ...value, ready: false })
            load(value.current).then(t => setValue({ ...value, t, ready: true }))
        }, [value.current])

        return (
            <Context.Provider value={value}>
                {children}
            </Context.Provider>
        )
    }
}

export default Localization;