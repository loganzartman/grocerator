import {Transition, Dialog} from '@headlessui/react';
import * as React from 'react';
import {useCallback, useState, Fragment} from 'react';
import {ShoppingList} from './ShoppingList';

export const ClearListButton = ({
  shoppingList,
  title,
}: {
  shoppingList: ShoppingList;
  title: string;
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const onSubmit = useCallback(() => {
    shoppingList.clear();
    setModalOpen(false);
  }, [shoppingList]);

  return (
    <>
      <button
        className="px-1 py-0.5 bg-neutral-100 border-2 border-solid border-neutral-300 rounded-md"
        onClick={() => setModalOpen(true)}
      >
        {title}
      </button>
      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setModalOpen(false)}
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-md bg-white py-4 px-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Clear this list?
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    This will remove all items. This action cannot be undone.
                  </p>
                </div>

                <div className="flex flex-row justify-end mt-8 gap-x-2">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={onSubmit}
                  >
                    Clear list
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
