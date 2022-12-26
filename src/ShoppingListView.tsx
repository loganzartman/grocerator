import * as React from 'react';
import {Item} from './Item';
import {useItemSearchResults} from './search';
import type {ShoppingList} from './ShoppingList';

const ShoppingListViewItem = ({item}: {item: Item}) => {
  const searchResults = useItemSearchResults(item);
  let extra = <td>loading...</td>;
  if (searchResults.state === 'ready') {
    const result = searchResults.data.data[0];
    const imageSrc = result.images
      .find((i: any) => i.perspective === 'front')
      .sizes.at(-1).url;
    extra = (
      <>
        <td>{result.description}</td>
        <td>{result.temperature.indicator}</td>
        <td>
          <img src={imageSrc} width={64} />
        </td>
      </>
    );
  }

  return (
    <tr>
      <td>{item.uid}</td>
      <td>{item.name}</td>
      {extra}
    </tr>
  );
};

export const ShoppingListView = ({
  shoppingList,
}: {
  shoppingList: ShoppingList;
}) => {
  const items = shoppingList
    .getItems()
    .map((item) => <ShoppingListViewItem item={item} key={item.uid} />);
  return (
    <table>
      <thead>
        <tr>
          <th>UID</th>
          <th>Name</th>
          <th>Description</th>
          <th>Temperature</th>
          <th>Image</th>
        </tr>
      </thead>
      <tbody>{items}</tbody>
    </table>
  );
};
