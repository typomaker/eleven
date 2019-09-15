import React, {Component} from "react";

const Context = React.createContext(undefined);
Context.displayName = 'Language';

export const Consumer = Context.Consumer;

export class Provider extends React.Component {
    watchID;
    state = {
        language: navigator.language,
        setLanguage: (language) => this.setState({language}),
        location: null
    };


    handleGeolocation(position) {
        this.setState({
            location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            }
        })
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(this.handleGeolocation.bind(this));
        this.watchID = navigator.geolocation.watchPosition(this.handleGeolocation.bind(this), () => {
            console.log('location not allowed')
        });
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }

    render = () => (
        <Context.Provider value={this.state}>
            {this.props.children}
        </Context.Provider>
    )
}

export const connect = (Component) => (props) => (
    <Consumer>
        {(state) => <Component environment={state} {...props}/>}
    </Consumer>
);

export default {
    connect,
    Provider,
    Consumer,
}
