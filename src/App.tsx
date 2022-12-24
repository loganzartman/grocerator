import * as React from 'react';
import {useCallback} from 'react';
import {loginHref} from './auth';
import {createItem} from './Item';
import {Omnibox} from './Omnibox';
import {useShoppingList} from './ShoppingList';
import {ShoppingListView} from './ShoppingListView';

export const App = () => {
  const shoppingList = useShoppingList();

  const handleOmniSubmit = useCallback((query: string) => {
    shoppingList.add(createItem({name: query}));
  }, []);

  return (
    <div className="flex col">
      <a href={loginHref()}>Login with Kroger</a>
      <Omnibox onSubmit={handleOmniSubmit} />
      <ShoppingListView shoppingList={shoppingList} />
    </div>
  );
};
