import React from 'react';

export const Title = () => {
  const makeShadow = (i: number, n: number) => {
    const offset = i * -2;
    const color = `hsl(0,0%,${((i / n) * 0.3 + 0.7) * 100}%)`;
    return `${offset}px ${offset}px 0px ${color}`;
  };
  const textShadow = Array.from({length: 32})
    .map((_, i, a) => makeShadow(i, a.length))
    .join(',');

  return (
    <div
      className="text-5xl text-center font-title text-[hsl(0,0%,10%)] mt-6 mb-6"
      style={{textShadow}}
    >
      grocerator
    </div>
  );
};
