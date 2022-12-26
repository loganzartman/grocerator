import {FetchResult, useFetch} from './fetch';
import {Item} from './Item';
import {useLocation} from './LocationContext';

export const useItemSearchResults = (item: Item): FetchResult => {
  const location = useLocation();

  return useFetch({
    url: 'https://api.kroger.com/v1/products',
    method: 'GET',
    params: {
      'filter.term': item.name,
      'filter.locationId': location,
    },
  });
};
