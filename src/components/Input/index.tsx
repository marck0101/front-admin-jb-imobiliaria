import { useEffect, useState } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

//@ts-ignore
import { ReactComponent as CircleCheckSolidSvg } from '../../assets/svgs/circle-check-solid.svg';
//@ts-ignore
import { ReactComponent as CircleXmarkSolidSvg } from '../../assets/svgs/circle-xmark-solid.svg';
import { Loader } from '../Loader';

type InputProps = JSX.IntrinsicElements['input'];

interface Props extends Omit<InputProps, 'className'> {
  label?: string;
  form?: UseFormReturn<FieldValues, any, undefined>;
  className?: string;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  schema?: z.ZodObject<any>;
  mask?: keyof typeof MASKS;
  isLoading?: boolean;
}

const CORRECT_INPUT_CLASSES = ' border border-green-500 bg-green-500/5';
const INCORRECT_INPUT_CLASSES = ' border border-red-500 bg-red-500/5';
const LOADING_INPUT_CLASSES = ' border border-primary bg-primary/5';
const DEFAULT_INPUT_CLASSES =
  ' outline-0 px-3 py-3 mt-1 w-full rounded-lg shadow-sm text-base focus:border-primary';

export function Input({
  label,
  isLoading,
  form,
  className,
  onInput,
  schema,
  mask,
  ...rest
}: Props) {
  const [classes, setClasses] = useState(
    (className || '') +
      DEFAULT_INPUT_CLASSES +
      ' border border-slate-300 bg-transparent',
  );

  const [isValid, setIsValid] = useState<null | boolean>(null);

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (mask && label && form) {
      form?.setValue(label, MASKS[mask](e));
      form.clearErrors(label);
    }

    handleCheckInputValue(e.target.value);

    if (onInput && typeof onInput == 'function') onInput(e);
  };

  const handleCheckInputValue = (value: string) => {
    if (label && schema && form) {
      if (schema.shape[label]) {
        const shape = schema.shape[label];

        if (shape.isOptional() && !value) {
          return;
        }

        const { success } = shape.safeParse(value);

        if (success) {
          setIsValid(true);
          form.clearErrors(label);
        } else {
          if (form.getFieldState(label).isTouched) setIsValid(false);
        }
      }

      if (form.getFieldState(label).error?.message) {
        // console.log(form.getFieldState(label).error?.message);
        setIsValid(false);
      }
    }
  };
  useEffect(() => {
    if (isValid !== null && !isLoading) {
      setClasses(
        (className || '') +
          DEFAULT_INPUT_CLASSES +
          (isValid ? CORRECT_INPUT_CLASSES : INCORRECT_INPUT_CLASSES),
      );
    }

    if (isLoading) {
      setClasses(
        (className || '') + DEFAULT_INPUT_CLASSES + LOADING_INPUT_CLASSES,
      );
    } else {
      if (form && label) {
        handleCheckInputValue(form.getValues(label));
      }
    }
  }, [isValid, isLoading]);

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex flex-row items-center justify-center relative">
          <input
            disabled={isLoading}
            {...(form && label ? form.register(label) : {})}
            className={classes}
            {...rest}
            onInput={handleInput}
          />

          {isLoading && (
            <div
              className="text-primary"
              style={{
                marginTop: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: 17,
              }}
            >
              <Loader size={18} stroke={4} />
            </div>
          )}
          {!isLoading && isValid !== null && (
            <div
              className={isValid ? 'text-green-500' : 'text-red-500'}
              style={{
                marginTop: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: 17,
              }}
            >
              {isValid ? <CircleCheckSolidSvg /> : <CircleXmarkSolidSvg />}
            </div>
          )}
        </div>
        {form && label && form.formState.errors[label] && (
          //@ts-ignore
          <p className="mt-2 text-red-500 font-semibold text-sm">
            {form.formState.errors[label].message}
          </p>
        )}
      </div>
    </>
  );
}
const MASKS = {
  money: (e: React.FormEvent<HTMLInputElement>) => {
    let v = e.target.value;
    v = v.replace(/\D/g, '');
    const number = isNaN(parseFloat(v) / 100) ? 0.0 : parseFloat(v) / 100;
    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  },
  cep: (e: React.FormEvent<HTMLInputElement>) => {
    let v = e.target.value;
    v = v.replace(/\D/g, '');

    if (v.length == 5) {
      v = v.replace(/^(\d{5})(\d{3})$/, '$1-');
    }

    if (v.length > 5) {
      v = v.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    }
    return v;
  },
  cnpj: (e: React.FormEvent<HTMLInputElement>) => {
    let v = e.target.value;
    v = v.replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
    return v;
  },
  cpf: (e: React.FormEvent<HTMLInputElement>) => {
    let v = e.target.value;
    v = v.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v;
  },
  'cpf/cnpj': (e: React.FormEvent<HTMLInputElement>) => {
    let v = e.target.value;
    v = v.replace(/\D/g, '');

    if (v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      v = v.replace(/^(\d{2})(\d)/, '$1.$2');
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
      v = v.replace(/(\d{4})(\d)/, '$1-$2');
    }

    return v;
  },
  phone: (e: React.FormEvent<HTMLInputElement>) => {
    let v = e.target.value;
    v = v.replace(/\D/g, '');

    if (v.length > 11) {
      v = v.slice(0, 11);
    }

    if (v.length === 2) {
      v = v.replace(/^(\d{2})$/, '($1)');
    }
    if (v.length === 3) {
      v = v.replace(/^(\d{2})(\d)$/, '($1) $2');
    }
    if (v.length === 4) {
      v = v.replace(/^(\d{2})(\d{2})$/, '($1) $2');
    }
    if (v.length === 5) {
      v = v.replace(/^(\d{2})(\d{3})$/, '($1) $2');
    }
    if (v.length === 6) {
      v = v.replace(/^(\d{2})(\d{4})$/, '($1) $2');
    }
    if (v.length === 7) {
      v = v.replace(/^(\d{2})(\d{4})(\d)$/, '($1) $2-$3');
    }
    if (v.length === 8) {
      v = v.replace(/^(\d{2})(\d{4})(\d{2})$/, '($1) $2-$3');
    }
    if (v.length === 9) {
      v = v.replace(/^(\d{2})(\d{4})(\d{3})$/, '($1) $2-$3');
    }
    if (v.length === 10) {
      v = v.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    if (v.length === 11) {
      v = v.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, '($1) $2 $3-$4');
    }

    return e.target.value.replace(/\D/g, '').length <= 3
      ? v.replace(/\D/g, '')
      : v;
  },
  date: (e: React.FormEvent<HTMLInputElement>) => {
    let v = e.target.value;
    v = v.replace(/\D/g, '').slice(0, 10);

    if (v.length >= 5) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    return v;
  },
} as const;
