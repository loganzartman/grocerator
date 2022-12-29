import * as React from 'react';
import {useCallback, useState} from 'react';
import {ClearListButton} from './ClearListButton';
import {createItem} from './Item';
import {LocationProvider} from './LocationContext';
import {LocationSelect} from './LocationSelect';
import {Omnibox, OmniboxSelection} from './Omnibox';
import {useLocallyPersistedShoppingList} from './ShoppingList';
import {ShoppingListView} from './ShoppingListView';

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
    <div className="flex flex-col mt-2">
      <div className="text-5xl text-center mb-6">grocerator</div>
      <LocationSelect onLocationSelected={handleLocationSelected} />
      <LocationProvider location={location}>
        <div className="flex flex-row mt-4 justify-center">
          <Omnibox
            savedItemList={savedItems}
            tripItemList={tripItems}
            onSubmit={handleOmniSubmit}
          />
        </div>
        <div className="flex flex-row mt-2 gap-x-2 justify-center">
          <ClearListButton shoppingList={tripItems} title="Clear this list" />
          <ClearListButton
            shoppingList={savedItems}
            title="Clear saved items"
          />
        </div>
        <div className="flex flex-row m-4 mt-6">
          <ShoppingListView shoppingList={tripItems} />
        </div>
      </LocationProvider>
    </div>
  );
};
