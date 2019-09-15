import React from 'react';

const Context = React.createContext(undefined);
export const Consumer = Context.Consumer;

export const Provider = class extends React.Component {
    state = {
        key: 'AIzaSyBUJwo1ytf4wOMKQK4kW8b-rh9hadFghfY',
        ready: false,
        geocode: this.geocode.bind(this),
        geocoder: null,
    };

    async geocode(params) {
        return new Promise((resolve, reject) => {
            this.state.geocoder.geocode(params, function (results, status) {
                if (status === 'OK') {
                    return resolve(results);
                } else {
                    return reject(results);
                }
            })
        });
    }

    onLoad() {
        this.setState({
            ready: true,
            geocoder: new window.google.maps.Geocoder()
        })
    }

    componentDidMount() {
        if (!window.google) {
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = `https://maps.google.com/maps/api/js?key=${this.state.key}`;
            s.async = true;
            s.defer = true;
            const x = document.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);
            s.addEventListener('load', this.onLoad.bind(this))
        } else {
            this.onLoad();
        }
    }

    render() {
        const {children} = this.props;
        return (
            <Context.Provider value={this.state}>
                {children}
            </Context.Provider>
        )
    }
};

export const connect = (Component) => (props) => (
    <Consumer>
        {state => <Component {...props} gmap={state}/>}
    </Consumer>
);

export default {
    connect,
    Provider,
    Context,
}