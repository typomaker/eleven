import React, { useState, useEffect } from "react";
import Dictionary from "./Dictionary";
interface Localization {
    ready: boolean,
    selected: keyof Localization["languages"],
    languages: Record<"ru" | "en", { title: string }>
    set: (value: keyof Localization["languages"]) => void,
    t?: Dictionary
}

namespace Localization {
    const initial: Localization = {
        selected: "ru",
        ready: false,
        languages: {
            "ru": { title: "Русский" },
            "en": { title: "English" },
        },
        set: () => { },
    }
    function isSupported(v: string): v is keyof Localization['languages'] {
        return initial.languages.hasOwnProperty(v);
    }
    async function load(v: keyof Localization['languages']): Promise<Dictionary> {
        return import("./translate/" + v).then(v => v.default);
    }
    const language = navigator?.language?.split("-")[0]
    if (isSupported(language)) {
        initial.selected = language;
    }
    export const Context = React.createContext<Localization>(initial);
    Context.displayName = "Language";

    export const Consumer = Context.Consumer;
    export const Provider: React.FunctionComponent = ({ children }) => {
        const [value, setValue] = useState<Localization>({
            ...initial,
            set: (selected: keyof Localization["languages"]) => {
                setValue({ ...value, selected })
            }
        });
        useEffect(() => {
            setValue({ ...value, ready: false })
            load(value.selected).then(t => setValue({ ...value, t, ready: true }))
        }, [value.selected])

        return (
            <Context.Provider value={value}>
                {children}
            </Context.Provider>
        )
    }
}

export default Localization;