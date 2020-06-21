import React from 'react';
import { Route, BrowserRouter } from "react-router-dom";
import { useLocation } from './hooks/Location';

import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';

const Routes: React.FC = () => {
  const { loading } = useLocation();
  if (loading) {
    return (
      <p>Carregando... </p>
    );
  }

  return (
    <BrowserRouter>
      <Route component={Home} path="/" exact />
      <Route component={CreatePoint} path="/create-point" />
    </BrowserRouter>
  );
}

export default Routes;