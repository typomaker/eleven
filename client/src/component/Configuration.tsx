import React, { ReactNode } from "react";

interface Props {
    language: string
}
interface State {
    language: string
}

const Context = React.createContext<State>({
    language: "ru"
});
Context.displayName = "Configuration";

const Consumer = Context.Consumer;
class Provider extends React.Component<Props, State>{
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = { language: props.language }
    }
    render(): ReactNode {
        return (
            <Context.Provider value={{ language: this.props.language }}>
                {this.props.children}
            </Context.Provider>
        )
    }
}

export default {
    Consumer,
    Provider,
}