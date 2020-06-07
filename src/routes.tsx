import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home';
import CreateCollectPoint from './pages/CreateCollectPoint';

const Routes = () => {
    return (
        <BrowserRouter>
            <Route component={Home} path="/" exact={true}/>
            <Route component={CreateCollectPoint} path="/cadastro"/>
        </BrowserRouter>
    )
}

export default Routes;