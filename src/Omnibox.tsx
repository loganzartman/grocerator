import * as React from 'react';
import {useCallback, useRef, useEffect} from 'react';
import type {KeyboardEvent} from 'react';

export const Omnibox = ({
  onSubmit,
}: {
  onQueryChange?: (query: string) => void;
  onSubmit?: (query: string) => void;
  changeDelay?: number;
}) => {
  const inputRef = useRef(null);
  useEffect(() => {
    const onFocus = () => {
      inputRef.current?.focus();
    };
    document.addEventListener('focus', onFocus);
    return () => document.removeEventListener('focus', onFocus);
  }, [inputRef]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onSubmit?.(event.currentTarget.value);
        event.currentTarget.value = '';
      }
    },
    []
  );

  return (
    <input
      ref={inputRef}
      autoFocus
      type="text"
      placeholder="type to search"
      onKeyDown={handleKeyDown}
    />
  );
};
