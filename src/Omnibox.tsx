import * as React from 'react';
import {useCallback, useMemo, useState} from 'react';
import {Combobox} from '@headlessui/react';
import {ShoppingList} from './ShoppingList';
import {Item} from './Item';
import ChevronUpDownIcon from '@heroicons/react/20/solid/ChevronUpDownIcon';

type CreateAction = {uid: string; action: 'create'; name: string};
type DeleteAction = {uid: string; action: 'delete'; name: string; item: Item};
type Action = CreateAction | DeleteAction;
export type OmniboxSelection = Item | Action;

const isAction = (selection: OmniboxSelection): selection is Action =>
  'action' in selection;

const optionClass = ({active}: {active: boolean}) =>
  `relative whitespace-nowrap cursor-default select-none px-2 py-1 rounded-md ${
    active ? 'bg-yellow-200' : ''
  }`;

export const Omnibox = ({
  savedItemList,
  tripItemList,
  onSubmit,
}: {
  savedItemList: ShoppingList;
  tripItemList: ShoppingList;
  onSubmit?: (value: OmniboxSelection) => void;
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

  const optionsData: OmniboxSelection[] = useMemo(() => {
    const savedItems = savedItemList.getItems();
    const tripItems = tripItemList.getItems();

    const matchingTripItem = tripItems.find((item) => item.name === value);
    const matchingSavedItem = savedItems.find((item) => item.name === value);
    const noMatchingItem = value && !matchingTripItem && !matchingSavedItem;

    return [
      ...[
        ...savedItems.filter((item) => !tripItemList.has(item)),
        ...tripItems.map((item) => ({
          uid: `delete ${item.name}`,
          action: 'delete' as const,
          name: item.name,
          item,
        })),
      ].filter((item) => item.name.includes(value)),
      noMatchingItem && {
        uid: `create ${value}`,
        action: 'create' as const,
        name: value,
      },
    ].filter(Boolean);
  }, [savedItemList, tripItemList, value]);

  const options = useMemo(
    () =>
      optionsData.map((option) =>
        'action' in option ? (
          <Combobox.Option
            className={optionClass}
            key={option.uid}
            value={option}
          >
            <span className="font-bold">{option.action}&nbsp;</span>
            {option.name}
          </Combobox.Option>
        ) : (
          <Combobox.Option
            key={option.uid}
            value={option}
            className={optionClass}
          >
            {option.name}
          </Combobox.Option>
        )
      ),
    [optionsData]
  );

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
        </Combobox.Options>
      </div>
    </Combobox>
  );
};
