import * as React from 'react';
import {useCallback, useState, ChangeEvent} from 'react';
import type {KeyboardEvent} from 'react';
import {Combobox} from '@headlessui/react';

const completionOptions = [
  {name: 'apple'},
  {name: 'banana'},
  {name: 'milk'},
  {name: 'tofu'},
];

export const Omnibox = ({
  onSubmit,
}: {
  onQueryChange?: (query: string) => void;
  onSubmit?: (query: string) => void;
  changeDelay?: number;
}) => {
  const [selected, setSelected] = useState<object>(completionOptions[0]);
  const [value, setValue] = useState<string>('');

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onSubmit?.(event.currentTarget.value);
        event.currentTarget.value = '';
      }
    },
    [onSubmit]
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.value);
    },
    []
  );

  const options = completionOptions.map((item) => (
    <Combobox.Option
      key={item.name}
      value={item.name}
      className={({active}) =>
        `relative whitespace-nowrap cursor-default select-none px-2 py-1 rounded-md ${
          active ? 'bg-yellow-200' : ''
        }`
      }
    >
      {item.name}
    </Combobox.Option>
  ));

  return (
    <Combobox value={selected} onChange={setSelected}>
      {({open}) => (
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full rounded-lg border-2 border-solid border-neutral-300 py-2 pl-3 pr-10 text-2xl leading-5 text-gray-900 focus:ring-0"
              onChange={handleInputChange}
              onKeyDown={!open && handleKeyDown}
            />
          </div>
          <Combobox.Options className="absolute z-10 w-full mt-1 bg-white py-1 text-lg ring-1 rounded-md shadow-lg">
            {options}
          </Combobox.Options>
        </div>
      )}
    </Combobox>
  );
};
