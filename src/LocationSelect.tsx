import * as React from 'react';
import {useCallback, useMemo, useState} from 'react';
import type {ChangeEvent} from 'react';
import {useFetch} from './fetch';
import {Listbox} from '@headlessui/react';
import {ChevronUpDownIcon} from '@heroicons/react/20/solid';

const GROCERY_DEPT = '23';

export const LocationSelect = ({
  onLocationSelected,
}: {
  onLocationSelected?: (id: string) => void;
}) => {
  const defaultOption: any = {
    locationId: null,
    name: 'Choose a store...',
  };
  const [zipCode, setZipCode] = useState<string>('');
  const [selected, setSelected] = useState<any>(defaultOption);

  const handleZipChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setZipCode(event.currentTarget.value);
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
      <Listbox.Option
        className={({active}) =>
          `relative whitespace-nowrap cursor-default select-none px-2 py-1 rounded-md ${
            active ? 'bg-yellow-200' : ''
          }`
        }
        value={loc}
        key={loc.locationId}
      >
        {loc.name}
      </Listbox.Option>
    ));
  }, [locationsResult]);

  const handleSelectedChange = useCallback(
    (value: any) => {
      setSelected(value);
      onLocationSelected?.(value.locationId);
    },
    [onLocationSelected]
  );

  return (
    <div className="flex flex-row justify-center gap-x-2">
      <input
        className="justify-self-end text-right w-[5em] shadow-inner px-2 py-1 rounded-md border-solid border-2 border-neutral-300"
        type="text"
        placeholder="ZIP code"
        onChange={handleZipChange}
      />
      <div className="relative">
        <Listbox
          value={selected}
          disabled={locationsResult.state !== 'ready'}
          onChange={handleSelectedChange}
        >
          <Listbox.Button className="disabled:opacity-50 relative justify-self-start shadow-inner px-2 py-1 pr-7 rounded-md border-solid border-2 border-neutral-300">
            <span className="block truncate">{selected.name}</span>
            <span className="pointer-events-none absolute pr-1 inset-y-0 right-0 flex items-center">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 bg-white py-1 text-base ring-1 rounded-md shadow-lg">
            {locationOptions}
          </Listbox.Options>
        </Listbox>
      </div>
    </div>
  );
};
