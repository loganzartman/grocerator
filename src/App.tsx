import * as React from 'react';
import {useCallback, useState} from 'react';
import {ClearListButton} from './ClearListButton';
import {createItem} from './Item';
import {LocationProvider} from './LocationContext';
import {LocationSelect} from './LocationSelect';
import {Omnibox, OmniboxSelection} from './Omnibox';
import {useLocallyPersistedShoppingList} from './ShoppingList';
import {ShoppingListView} from './ShoppingListView';
import {Title} from './Title';

export const App = () => {
  const [location, setLocation] = useState<string | null>(null);
  const savedItems = useLocallyPersistedShoppingList('saved');
  const tripItems = useLocallyPersistedShoppingList('trip');

  const handleLocationSelected = useCallback((newLocation: string) => {
    setLocation(newLocation);
  }, []);

  const handleOmniSubmit = useCallback(
    (selection: OmniboxSelection) => {
      if (!('action' in selection)) {
        tripItems.add(selection);
      } else if (selection.action === 'create') {
        const item = createItem({name: selection.name});
        tripItems.add(item);
        savedItems.add(item);
      } else if (selection.action === 'delete') {
        tripItems.remove(selection.item);
      } else {
        throw new Error('Unsupported selection');
      }
    },
    [tripItems, savedItems]
  );

  return (
    <div className="flex flex-col">
      <Title />
      <LocationSelect onLocationSelected={handleLocationSelected} />
      <LocationProvider location={location}>
        <div className="mt-4 flex flex-row justify-center">
          <Omnibox
            savedItemList={savedItems}
            tripItemList={tripItems}
            onSubmit={handleOmniSubmit}
          />
        </div>
        <div className="mt-2 flex flex-row justify-center gap-x-2">
          <ClearListButton shoppingList={tripItems} title="Clear this list" />
          <ClearListButton
            shoppingList={savedItems}
            title="Clear saved items"
          />
        </div>
        <div className="m-4 mt-6 flex flex-row">
          <ShoppingListView shoppingList={tripItems} />
        </div>
      </LocationProvider>
    </div>
  );
};
