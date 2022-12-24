import * as React from 'react';
import {useContext, useState} from 'react';
import type {Item} from './Item';

type ShoppingListData = {[k: string]: Item};

export type ShoppingList = {
  data: ShoppingListData;
  getItems: () => Item[];
  add: (item: Item) => void;
};

export const useShoppingList = (): ShoppingList => {
  const [data, setData] = useState<ShoppingListData>(() => ({}));
  const getItems = () => Object.values(data);
  const add = (item: Item) => {
    setData((data) => ({...data, [item.uid]: item}));
  };

  return {
    data,
    getItems,
    add,
  };
};
