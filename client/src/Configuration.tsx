import React from "react";

interface Configuration {
    language: string
    domain: string
    set: (value: Omit<Configuration, "set">) => void
}

namespace Configuration {
    const defaultValue = {
        language: navigator.language ?? "ru",
        domain: process.env.DOMAIN!,
        set: () => { }
    }
    const Context = React.createContext<Configuration>(defaultValue);
    Context.displayName = "Configuration";

    type Props = Partial<Omit<Configuration, "set">>
    type State = Required<Configuration>
    export const Consumer = Context.Consumer;
    export class Provider extends React.Component<Props, State>{
        constructor(props: Readonly<Props>) {
            super(props);
            this.state = {
                ...defaultValue,
                ...props,
                set: (value) => this.setState({ ...this.state, ...value }),
            };
        }

        render() {
            return (
                <Context.Provider value={this.state}>
                    {this.props.children}
                </Context.Provider>
            )
        }
    }
    export function wrap<P extends object>(Component: React.ComponentType<P>): React.FC<Omit<P, "configuration">> {
        return (props) => (
            <Consumer>
                {(value) => <Component {...props as P} configuration={value} />}
            </Consumer>
        );
    }
}

export default Configuration;