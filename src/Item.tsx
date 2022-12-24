export type Item = {
  uid: string;
  name: string;
  codes: string[];
};

export type CreateItemParams = Pick<Item, 'name'> & Partial<Item>;

export const createItem = (itemParams: CreateItemParams): Item => {
  return {
    uid: window.crypto.randomUUID(),
    codes: [],
    ...itemParams,
  };
};
