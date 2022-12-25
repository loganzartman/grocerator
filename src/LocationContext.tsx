import * as React from 'react';
import {useContext} from 'react';

export type Location = string;

export const LocationContext = React.createContext<Location | null>(null);

export const LocationProvider = (props: {
  location: Location;
  children: React.ReactNode;
}) => (
  <LocationContext.Provider value={props.location}>
    {props.children}
  </LocationContext.Provider>
);

export const useLocation = () => {
  return useContext(LocationContext);
};
