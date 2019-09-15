import React from 'react'
import {BrowserRouter as Router,Route, Link} from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline';
import Api from './Api';
import Bar from './Bar';
import Environment from './Environment';
import Gmap from './GMap';
const About = () => <h2>Home</h2>;
class App extends React.Component {
    render() {
        return (
            <React.Fragment>
                <CssBaseline/>
                <Environment.Provider>
                    <Api.Provider>
                        <Gmap.Provider>
                            <Bar/>
                            <Router>
                                <Route path="/speech" component={About} />
                            </Router>
                        </Gmap.Provider>
                    </Api.Provider>
                </Environment.Provider>
            </React.Fragment>
        )
    }
}

export default App

