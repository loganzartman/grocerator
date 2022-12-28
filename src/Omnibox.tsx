import * as React from 'react';
import {useCallback, useState} from 'react';
import type {KeyboardEvent} from 'react';
import {Combobox} from '@headlessui/react';
import {ShoppingList} from './ShoppingList';
import {Item} from './Item';

export type OmniboxSelection = Item | {action: 'create'; name: string};

const optionClass = ({active}: {active: boolean}) =>
  `relative whitespace-nowrap cursor-default select-none px-2 py-1 rounded-md ${
    active ? 'bg-yellow-200' : ''
  }`;

export const Omnibox = ({
  shoppingList,
  onSubmit,
}: {
  shoppingList: ShoppingList;
  onQueryChange?: (query: string) => void;
  onSubmit?: (value: OmniboxSelection) => void;
  changeDelay?: number;
}) => {
  const [selected, setSelected] = useState<OmniboxSelection>(null);
  const [value, setValue] = useState<string>('');

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && !!selected) {
        onSubmit?.(selected);
        setValue('');
        setSelected(null);
      }
    },
    [onSubmit, selected]
  );

  const options = shoppingList
    .getItems()
    .filter((item) => item.name.includes(value))
    .map((item) => (
      <Combobox.Option key={item.uid} value={item} className={optionClass}>
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
              onChange={(event) => setValue(event.currentTarget.value)}
              displayValue={(item: any) => item?.name}
              onKeyDown={!open && handleKeyDown}
            />
          </div>
          <Combobox.Options className="absolute z-10 w-full mt-1 bg-white py-1 text-lg ring-1 rounded-md shadow-lg">
            {options}
            {value.length > 0 && (
              <Combobox.Option
                className={optionClass}
                value={{action: 'create', name: value}}
              >
                <span className="font-bold">Create </span>
                {value}
              </Combobox.Option>
            )}
          </Combobox.Options>
        </div>
      )}
    </Combobox>
  );
};
