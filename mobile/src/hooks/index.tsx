import React from 'react';

import { LocationProvider } from './Location';

const AppProvider: React.FC = ({children}) => (
  <LocationProvider>{children}</LocationProvider>
);

export default AppProvider;