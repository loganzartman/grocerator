import * as React from 'react';
import {useCallback, useState} from 'react';
import {createItem} from './Item';
import {LocationProvider} from './LocationContext';
import {LocationSelect} from './LocationSelect';
import {Omnibox} from './Omnibox';
import {useLocallyPersistedShoppingList} from './ShoppingList';
import {ShoppingListView} from './ShoppingListView';

export const App = () => {
  const [location, setLocation] = useState<string | null>(null);
  const shoppingList = useLocallyPersistedShoppingList('main');

  const handleLocationSelected = useCallback((newLocation: string) => {
    setLocation(newLocation);
  }, []);

  const handleOmniSubmit = useCallback((query: string) => {
    shoppingList.add(createItem({name: query}));
  }, []);

  return (
    <div className="flex col">
      <LocationSelect onLocationSelected={handleLocationSelected} />
      <LocationProvider location={location}>
        <Omnibox onSubmit={handleOmniSubmit} />
        <ShoppingListView shoppingList={shoppingList} />
      </LocationProvider>
    </div>
  );
};
