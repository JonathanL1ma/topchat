import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from '../Home';
import Chat from '../../pages/Chat';

const App = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={ Home } />
                <Route exact path="/chat" component={ Chat } />
            </Switch>
        </BrowserRouter>
    )
}

export default App
