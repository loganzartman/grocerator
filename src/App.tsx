import * as React from 'react';
import {useCallback, useState} from 'react';
import {ClearListButton} from './ClearListButton';
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

  const handleOmniSubmit = useCallback(
    (query: string) => {
      shoppingList.add(createItem({name: query}));
    },
    [shoppingList]
  );

  return (
    <div className="flex flex-col mt-6">
      <LocationSelect onLocationSelected={handleLocationSelected} />
      <LocationProvider location={location}>
        <div className="flex flex-row mt-4 justify-center">
          <Omnibox onSubmit={handleOmniSubmit} />
        </div>
        <ClearListButton shoppingList={shoppingList} />
        <ShoppingListView shoppingList={shoppingList} />
      </LocationProvider>
    </div>
  );
};
