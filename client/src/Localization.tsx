import React from "react";
import Configuration from "./Configuration"

export interface Localization {
    readonly language: string,
    readonly languages?: { [K: string]: string },
    readonly dictionary?: { [K: string]: string },
}

export namespace Localization {
    const initial: Localization = { language: navigator?.language?.split("-")[0] }
    const Context = React.createContext<Localization>(initial);
    Context.displayName = "Language";

    export const useContext = () => React.useContext(Context)
    export const useTranslator = () => {
        const context = useContext();
        return (key: string, fallback?: string) => {
            if (!context.dictionary || !context.dictionary[key]) return fallback ?? key;
            return context.dictionary[key];
        }
    }
    export const Provider: React.FunctionComponent = ({ children }) => {
        const configuration = React.useContext(Configuration.Context);
        const [localization, setLocalization] = React.useState<Localization>(initial);

        React.useEffect(() => {
            (async function load(): Promise<any> {
                try {
                    const result = await fetch(`${configuration.http}/localization/${localization.language}`);
                    if (!result.ok) throw new Error(`${result.status} ${result.statusText}`)
                    const json = await result.json();
                    setLocalization((prev) => ({ ...prev, dictionary: json }))
                } catch (e) {
                    console.error(e);
                    setTimeout(() => load(), 3000)
                }
            })()
        }, [localization.language, configuration.http])

        React.useEffect(() => {
            (async function load(): Promise<any> {
                try {
                    const result = await fetch(`${configuration.http}/localization`);
                    if (!result.ok) throw new Error(`${result.status} ${result.statusText}`)
                    const json = await result.json();
                    setLocalization((prev) => ({ ...prev, languages: json }))
                } catch (e) {
                    console.error(e);
                    setTimeout(() => load(), 3000)
                }
            })()
        }, [])

        return (
            <Context.Provider value={localization}>
                {children}
            </Context.Provider>
        )
    }
}

export default Localization;