import './index.css';

// @ts-ignore
import { ReactComponent as ChevronUpSvg } from '../../assets/svgs/chevron-up.svg';
// @ts-ignore
import { ReactComponent as ChevronDownSvg } from '../../assets/svgs/chevron-down.svg';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ICustomer } from '../../@types/costumer';
import { useFetch } from '../../hooks/useFetch';
import { useDebounce } from '../../hooks/useDebounce';

const container = {
  hidden: { opacity: 1, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { x: 20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
  },
};

interface CustomersSelectProps {
  onSelect: (customer: ICustomer) => void;
}

export function CustomersSelect({ onSelect }: CustomersSelectProps) {
  const { api } = useFetch();

  const inputRef = useRef();
  const inputSearchWrapperRef = useRef();
  const selectWrapperRef = useRef();

  const [isOpen, setIsOpen] = useState(false);

  const [search, setSearch] = useState<string | null>(null);

  const [data, setData] = useState([] as Array<ICustomer>);
  const [total, setTotal] = useState(0);

  const fetchCustomers = async ({ name }: { name?: string }) => {
    try {
      let url = '/customers?limit=20&';
      if (name) url += `name=${name}`;

      const { data } = await api.get(url);
      return data;
    } catch (e) {
      return { data: [], count: 0 };
    }
  };

  useDebounce(
    async () => {
      const { data, count } = await fetchCustomers({ name: search || '' });
      setData(data);
      setTotal(count);
    },
    [search],
    300,
  );

  const handleSelect = useCallback(
    (customer: ICustomer) => {
      setSearch(null);
      onSelect?.(customer);
      setIsOpen(false);
      setSearch(null);
    },
    [onSelect],
  );

  useEffect(() => {
    //@ts-ignore
    const onClickOutside = (e) => {
      //@ts-ignore
      if (selectWrapperRef.current.contains(e.target)) return;
      setIsOpen(false);
      setSearch('');
    };

    if (isOpen) {
      //@ts-ignore
      if (inputSearchWrapperRef?.current?.children?.length) {
        const children = inputSearchWrapperRef.current.children[0];
        if (children.nodeName != 'P') children.focus();
      }

      window.addEventListener('click', onClickOutside);
    }

    return () => window.removeEventListener('click', onClickOutside);
  }, [isOpen]);

  useEffect(() => {
    (async () => {
      const { data, count } = await fetchCustomers({});
      setData(data);
      setTotal(count);
    })();
  }, []);

  return (
    //@ts-ignore
    <div ref={selectWrapperRef} className="relative w-full">
      <button
        //@ts-ignore
        ref={inputRef}
        onClick={() => setIsOpen((o) => !o)}
        className="flex flex-row justify-between border hover:border-gray border-slate-300 bg-transparent duration-200 items-center px-4 py-3 relative outline-0 w-full rounded-lg shadow-sm text-base focus-within:border-blue cursor-pointer"
      >
        <div ref={inputSearchWrapperRef} style={{ pointerEvents: 'none' }}>
          {isOpen && (
            <input
              onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
                e.stopPropagation();
                e.preventDefault();
                //@ts-ignore
                setSearch(e.target.value);
              }}
              style={{ all: 'unset', textAlign: 'left', pointerEvents: 'none' }}
              type="text"
              placeholder="Pesquisar"
            />
          )}
          {!isOpen && <p className="text-slate-400">Selecione um cliente</p>}
        </div>

        <div className="text-zinc-400 mr-0.5">
          {isOpen ? <ChevronUpSvg /> : <ChevronDownSvg />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            exit={{ opacity: 0 }}
            style={{
              //@ts-ignore
              minWidth: inputRef?.current?.offsetWidth || 0,
              maxHeight: 256,
            }}
            className="absolute select-list container flex flex-col gap-1 z-50 bg-white p-2 w-fit mt-2 rounded-b-md overflow-y-auto overflow-x-hidden"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            {!data.length && (
              <motion.div
                variants={item}
                className={
                  'item flex flex-row gap-3 items-center justify-start rounded-md px-3 cursor-pointer text-left py-3  hover:bg-slate-100'
                }
              >
                <p className="text-center text-slate-400">
                  Nenhum resultado encontrado
                </p>
              </motion.div>
            )}

            {data.map((option) => (
              <motion.button
                key={option._id}
                onClick={() => handleSelect(option as ICustomer)}
                variants={item}
                className={
                  'item flex flex-col justify-start rounded-md px-3 cursor-pointer text-left py-3 hover:bg-slate-100'
                }
              >
                <p className="text-left">{option.name}</p>
                <p className="text-left text-xs text-gray/70">
                  {option.fantasyname ||
                    option.email ||
                    option.phone ||
                    option.cpf ||
                    option.cnpj}{' '}
                </p>
              </motion.button>
            ))}

            {data.length > total && (
              <motion.div
                variants={item}
                className={
                  'item flex flex-row gap-3 items-center justify-start rounded-md px-3 cursor-pointer text-left py-3  hover:bg-slate-100'
                }
              >
                <p className="text-center text-slate-400">
                  +{total - data.length} Resultados encontrados
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
