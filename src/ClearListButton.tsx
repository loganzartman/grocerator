import * as React from 'react';
import {useCallback} from 'react';
import {ShoppingList} from './ShoppingList';

export const ClearListButton = ({
  shoppingList,
}: {
  shoppingList: ShoppingList;
}) => {
  const onClick = useCallback(() => {
    shoppingList.clear();
  }, [shoppingList]);

  return (
    <button onClick={onClick} style={{maxWidth: '5em'}}>
      Clear list
    </button>
  );
};
