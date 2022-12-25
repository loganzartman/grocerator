import {FetchResult, useFetchData} from './fetch';
import {Item} from './Item';

export const useItemSearchResults = (item: Item): FetchResult => {
  return useFetchData({
    url: 'https://api.kroger.com/v1/products',
    method: 'GET',
    params: {
      'filter.term': item.name,
    },
  });
};
