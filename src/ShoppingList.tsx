import {useEffect, useMemo, useState} from 'react';
import type {Item} from './Item';

type ShoppingListData = {[k: string]: Item};

export type ShoppingList = {
  data: ShoppingListData;
  setData: (data: ShoppingListData) => void;
  getItems: () => Item[];
  has: (item: Item) => boolean;
  add: (item: Item) => void;
  mutate: (item: Item, changes: Partial<Item>) => Item;
  remove: (item: Item) => Item;
  clear: () => void;
};

export const useShoppingList = (): ShoppingList => {
  const [data, setData] = useState<ShoppingListData>(() => ({}));
  const getItems = () => Object.values(data);
  const has = (item: Item) => item.uid in data;
  const add = (item: Item) => {
    setData((data) => ({...data, [item.uid]: item}));
  };
  const mutate = (item: Item, changes: Partial<Item>) => {
    if (!(item.uid in data)) {
      throw new Error(`Item with ID ${item.uid} does not exist in this list.`);
    }
    if ('uid' in changes && changes.uid !== item.uid) {
      throw new Error('Cannot mutate Item.uid');
    }
    const newItem = {...item, ...changes};
    setData((data) => ({...data, [item.uid]: newItem}));
    return newItem;
  };
  const remove = (item: Item) => {
    let removedItem;
    setData((data) => {
      const {[item.uid]: removed, ...rest} = data;
      removedItem = removed;
      return rest;
    });
    return removedItem;
  };
  const clear = () => {
    setData(() => ({}));
  };

  return {
    data,
    setData,
    getItems,
    has,
    add,
    mutate,
    remove,
    clear,
  };
};

export const useLocallyPersistedShoppingList = (
  listName: string
): ShoppingList => {
  const shoppingList = useShoppingList();
  const {setData} = shoppingList;
  const storageKey = useMemo(() => `shoppingList.${listName}`, [listName]);

  useEffect(() => {
    setData(JSON.parse(localStorage.getItem(storageKey) ?? '{}'));
  }, [storageKey, setData]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(shoppingList.data));
  }, [shoppingList.data, storageKey]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === storageKey &&
        event.newValue !== JSON.stringify(shoppingList.data)
      ) {
        shoppingList.setData(JSON.parse(event.newValue ?? '{}'));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, [shoppingList, storageKey]);

  return shoppingList;
};
