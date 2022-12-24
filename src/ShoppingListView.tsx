import * as React from 'react';
import type {ShoppingList} from './ShoppingList';

export const ShoppingListView = ({
  shoppingList,
}: {
  shoppingList: ShoppingList;
}) => {
  const items = shoppingList.getItems().map((item) => (
    <div className="flex row">
      <div>{item.uid}</div>
      <div>{item.name}</div>
    </div>
  ));
  return <div className="flex col">{items}</div>;
};
