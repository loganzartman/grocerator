import {randomUUID} from './util';

export type Item = Readonly<{
  uid: string;
  name: string;
  codes: string[];
}>;

export type CreateItemParams = Pick<Item, 'name'> & Partial<Item>;

export const createItem = (itemParams: CreateItemParams): Item => {
  return {
    uid: `item_${randomUUID()}`,
    codes: [],
    ...itemParams,
  };
};

const itemCache = new Map<string, Item>();

export const hashconsItem = (item: Item): Item => {
  if (!itemCache.has(item.uid)) {
    itemCache.set(item.uid, item);
  }
  return itemCache.get(item.uid);
};
