import * as React from 'react';
import {useCallback, useMemo, useState} from 'react';
import {Combobox} from '@headlessui/react';
import {ShoppingList} from './ShoppingList';
import {Item} from './Item';
import {
  PlusCircleIcon,
  TrashIcon,
  ChevronUpDownIcon,
  MinusCircleIcon,
} from '@heroicons/react/24/outline';

type CreateAction = {uid: string; action: 'create'; name: string};
type DeleteAction = {uid: string; action: 'delete'; name: string; item: Item};
type Action = CreateAction | DeleteAction;
export type OmniboxSelection = Item | Action;

const isAction = (selection: OmniboxSelection): selection is Action =>
  'action' in selection;

const actionIcons = {
  create: <PlusCircleIcon className="w-5 h-5" aria-hidden={true} />,
  delete: <MinusCircleIcon className="w-5 h-5" aria-hidden={true} />,
};

const optionClass = ({active}: {active: boolean}) =>
  `relative whitespace-nowrap cursor-default select-none px-2 py-1 pl-8 m-1 rounded-md ${
    active ? 'bg-yellow-100 transition-none' : 'transition-colors'
  }`;

const OptionIconContainer = ({children}: {children: React.ReactNode}) => (
  <span className={'absolute inset-y-0 left-0 flex items-center pl-2'}>
    {children}
  </span>
);

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
            <span className="text-yellow-700 font-bold">
              {option.action}&nbsp;
            </span>
            {option.name}
            <OptionIconContainer>
              <span className="text-yellow-700">
                {actionIcons[option.action]}
              </span>
            </OptionIconContainer>
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
    <div className="w-[36rem]">
      <Combobox value={selected} onChange={handleChange}>
        {({open}) => (
          <div className="relative">
            <div className="">
              <Combobox.Input
                className={`w-full ${
                  open
                    ? 'rounded-t-lg bg-white border-t-2 border-x-2'
                    : 'rounded-lg bg-yellow-100 text-gray-900 focus:border-2'
                } border-yellow-700 text-yellow-700 transition py-2 pl-3 pr-10 text-2xl leading-5 outline-none`}
                onChange={(event) => setValue(event.currentTarget.value)}
                displayValue={(item: any) => item?.name}
              />
              <Combobox.Button className="absolute right-0 inset-y-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-yellow-700"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
            <Combobox.Options className="absolute z-10 w-full max-h-60 overflow-auto bg-white text-lg rounded-b-lg shadow-lg border-b-2 border-x-2 border-yellow-700">
              {options}
            </Combobox.Options>
          </div>
        )}
      </Combobox>
    </div>
  );
};
