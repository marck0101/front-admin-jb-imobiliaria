import { DatePicker } from 'antd';
import { DatePickerType } from 'antd/es/date-picker';

/* eslint-disable */
//@ts-ignore
import locale from 'antd/es/date-picker/locale/pt_BR';

import './styles.css';

interface Props extends Partial<DatePickerType> {
  className?: string;
}

export function Datepicker({ className, ...rest }: Props) {
  className =
    (className || '') +
    ' cursor-pointer outline-0 px-3 py-3 mt-1 w-full rounded-lg border border-slate-300 bg-transparent shadow-sm text-base focus:border-primary';

  return (
    <DatePicker
      locale={locale}
      style={{
        height: 49.6,
      }}
      onChange={(e) => console.log(e)}
      placeholder="Selecione a data"
      className={className}
      format="DD/MM/YYYY"
      {...rest}
    />
  );
}
