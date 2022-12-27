import * as React from 'react';
import {Item} from './Item';
import {useItemSearchResults} from './search';
import type {ShoppingList} from './ShoppingList';

const mapResultToColumns = (result: any) => {
  const aisle = result.aisleLocations[0]?.description;
  const description = result.description;
  const imageSrc = result.images
    .find((i: any) => i.perspective === 'front')
    .sizes.at(-1).url;
  const temperature = result.temperature.indicator;
  return {aisle, description, imageSrc, temperature};
};

const ShoppingListViewItem = ({item}: {item: Item}) => {
  const searchResults = useItemSearchResults(item);
  let extra = <td>loading...</td>;
  if (searchResults.state === 'ready') {
    const result = searchResults.data.data[0];
    const columns = mapResultToColumns(result);
    extra = (
      <>
        <td>{columns.aisle}</td>
        <td>{columns.description}</td>
        <td>{columns.temperature}</td>
        <td>
          <img src={columns.imageSrc} width={64} />
        </td>
      </>
    );
  }

  return (
    <tr>
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
          <th>Name</th>
          <th>Aisle</th>
          <th>Description</th>
          <th>Temperature</th>
          <th>Image</th>
        </tr>
      </thead>
      <tbody>{items}</tbody>
    </table>
  );
};
