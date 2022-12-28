import * as React from 'react';
import {useCallback, useState} from 'react';
import {Combobox} from '@headlessui/react';
import {ShoppingList} from './ShoppingList';
import {Item} from './Item';
import ChevronUpDownIcon from '@heroicons/react/20/solid/ChevronUpDownIcon';

type ActionEnum = 'create' | 'delete';
type Action = {action: ActionEnum; name: string};
export type OmniboxSelection = Item | Action;

const isAction = (selection: OmniboxSelection): selection is Action =>
  'action' in selection;

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

  const reset = useCallback(() => {
    setSelected(null);
    setValue('');
  }, []);

  const handleChange = useCallback(
    (newSelected: OmniboxSelection) => {
      onSubmit?.(newSelected);
      reset();
    },
    [onSubmit, reset]
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
    <Combobox value={selected} onChange={handleChange}>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
          <Combobox.Input
            className="w-full rounded-lg border-2 border-solid border-neutral-300 py-2 pl-3 pr-10 text-2xl leading-5 text-gray-900 focus:ring-0"
            onChange={(event) => setValue(event.currentTarget.value)}
            displayValue={(item: any) => item?.name}
          />
          <Combobox.Button className="absolute right-0 inset-y-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
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
    </Combobox>
  );
};
