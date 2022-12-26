import * as React from 'react';
import {useCallback, useMemo, useState} from 'react';
import type {ChangeEvent} from 'react';
import {useFetch} from './fetch';

const GROCERY_DEPT = '23';

export const LocationSelect = (props: {
  onLocationSelected?: (id: string) => void;
}) => {
  const [zipCode, setZipCode] = useState<string>('');
  const [selected, setSelected] = useState<string>('');

  const handleZipChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setZipCode(event.currentTarget.value);
    },
    []
  );

  const handleSelectedChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const locationId = event.currentTarget.value;
      setSelected(locationId);
      props.onLocationSelected?.(locationId);
    },
    []
  );

  const locationsResult = useFetch({
    url: 'https://api.kroger.com/v1/locations',
    method: 'GET',
    params: {
      'filter.zipCode.near': zipCode,
      'filter.limit': '8',
      'filter.department': GROCERY_DEPT,
    },
    skip: zipCode.length !== 5,
  });

  const locationOptions = useMemo(() => {
    if (locationsResult.state !== 'ready') {
      return null;
    }
    return locationsResult.data.data.map((loc: any) => (
      <option value={loc.locationId} key={loc.locationId}>
        {loc.name}
      </option>
    ));
  }, [locationsResult]);

  return (
    <div className="flex row">
      <input type="text" placeholder="ZIP code" onChange={handleZipChange} />
      <select
        disabled={locationsResult.state !== 'ready'}
        value={selected}
        onChange={handleSelectedChange}
      >
        <option value={''}>Choose store location</option>
        {locationOptions}
      </select>
    </div>
  );
};
