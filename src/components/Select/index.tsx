import { ReactNode } from 'react';

interface Props extends Select {
  children: ReactNode;
}

type Select = JSX.IntrinsicElements['select'];

export function Select({ children, ...rest }: Props) {
  return (
    <select
      {...rest}
      className="appearance-none outline-0 px-3 py-3 mt-1 w-full rounded-lg border border-slate-300 bg-transparent shadow-sm text-base focus:border-primary"
    >
      {children}
    </select>
  );
}
