import React from 'react';
import Entry from './Entry';
import api from '../src/lib/api';
import store from 'store';
const storeKey = 'session:0';

const Context = React.createContext(undefined);
Context.displayName = 'Api';

export const Consumer = Context.Consumer;

export class Provider extends React.Component {
    state = {
        entry: false,
        provide: {
            session: null,
            isAnonymous: () => !this.state.provide.session,
            signin: this.signin.bind(this),
            signout: this.signout.bind(this),
            crud: Object.freeze({
                create: (resource, body, params = {}) => api.create(resource, body, {token: this.state.provide.session.id, ...params}),
                read: (resource, params = {}) => api.read(resource, {token: this.state.provide.session.id, ...params}),
                update: (resource, body, params = {}) => api.update(resource, body, {token: this.state.provide.session.id, ...params}),
                delete: (resource, params = {}) => api.delete(resource, {token: this.state.provide.session.id, ...params}),
            }),
        }
    };

    signin() {
        this.setState({entry: true});
    }

    async signout() {
        await this.state.provide.crud.delete('session/self');
        this.setState({provide: {...this.state.provide, session: null}});
        store.clearAll();
    }

    handleEntryConfirm = async (session) => {
        store.set(storeKey, session);
        this.setState({
            entry: false,
            provide: {...this.state.provide, session}
        })
    };

    handleEntryCancel = () => {
        this.setState({entry: false})
    };

    componentWillMount() {
        this.state.provide.session = store.get(storeKey) || null;
    }

    render() {
        return (
            <React.Fragment>
                <Context.Provider value={this.state.provide}>
                    {this.props.children}
                </Context.Provider>
                <Entry open={!!this.state.entry}
                       onConfirm={this.handleEntryConfirm}
                       onCancel={this.handleEntryCancel}
                />
            </React.Fragment>
        )
    }
}

export default {
    Provider,
    Consumer,
}