import * as React from 'react';
import {useCallback, useMemo, useState} from 'react';
import type {ChangeEvent} from 'react';
import {useFetch} from './fetch';
import {Listbox} from '@headlessui/react';
import {ChevronUpDownIcon} from '@heroicons/react/24/outline';

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
          `relative whitespace-nowrap text-purple-800 cursor-default select-none px-2 py-1 m-1 rounded-md ${
            active ? 'bg-purple-100 transition-none' : 'transition-colors'
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
        className="justify-self-end text-right w-[5em] rounded-md bg-purple-100 text-purple-700 focus:border-2 border-purple-700 transition outline-none"
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
          {({open}) => (
            <>
              <Listbox.Button
                className={`w-72 ${
                  open
                    ? 'rounded-t-md bg-white text-purple-800 border-t-2 border-x-2'
                    : 'rounded-md bg-purple-100 text-purple-700 focus:border-2'
                } disabled:opacity-50 relative justify-self-start border-purple-700 transition py-2 pl-3 pr-10 text-base leading-5 outline-none`}
              >
                <span className="block truncate">{selected.name}</span>
                <span className="pointer-events-none absolute pr-1 inset-y-0 right-0 flex items-center">
                  <ChevronUpDownIcon className="w-5 h-5" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute transition z-10 w-full text-ellipsis max-h-60 overflow-auto bg-white text-base rounded-b-lg shadow-lg border-b-2 border-x-2 border-purple-700">
                {locationOptions}
              </Listbox.Options>
            </>
          )}
        </Listbox>
      </div>
    </div>
  );
};
