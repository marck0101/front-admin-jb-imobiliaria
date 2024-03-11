/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Tooltip,
} from '@mui/material';

import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

//@ts-ignore
import { ReactComponent as PenToSquareSvg } from '../../../../assets/svgs/pen-to-square-solid.svg';
//@ts-ignore
import { ReactComponent as TrashSvg } from '../../../../assets/svgs/trash-solid.svg';
//@ts-ignore
import { ReactComponent as PlusSvg } from '../../../../assets/svgs/plus-solid.svg';
//@ts-ignore
import { ReactComponent as AlertSvg } from '../../../../assets/svgs/alert.svg';

import { ICustomer } from '../../../../@types/costumer';
import { formatToCPF } from '../../../../helpers/format-to-cpf';
import { formatToPhone } from '../../../../helpers/phone';

interface Passenger extends ICustomer {
  seat: number | string;
}

interface CardProps {
  data: Passenger | any;
  onDelete: (customerId: string) => void; // Adicionando a propriedade onDelete
  onAdjustAccent: (customerId: string) => void;
  accent: ICustomer;
}

function CardPassageiros({
  data,
  onDelete,
  onAdjustAccent,
  accent,
}: CardProps) {
  const handleDelete = () => {
    data.seat = selectedAcento; // aqui deleta a poltrona atual
    onDelete(data);
  };

  const [selectedAcento, setSelectedAcento] = useState(data?.seat);

  const handleChange = (event: SelectChangeEvent) => {
    // console.log('event.target.value', event.target.value);
    setSelectedAcento(event.target.value);

    const cliente = {
      banco: parseFloat(event.target.value),
      cliente: {
        ...data,
        seat: parseInt(data?.seat),
      },
    };
    //@ts-ignore
    onAdjustAccent(cliente);
  };
  // useEffect(() => {
  //   console.log('data==>', data);
  // }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Grid container xs={12}>
        <div className="grid grid-cols-12 items-center justify-center w-full rounded-2xl bg-white shadow-sm border border-slate-200 py-5">
          <Tooltip
            title={
              data.fantasyname
                ? data.fantasyname.toUpperCase()
                : data.name.toUpperCase()
            }
          >
            <p className="text-black/70 text-sm text-left font-bold col-span-2 ml-8 truncate pr-4">
              {data.fantasyname
                ? data.fantasyname.toUpperCase()
                : data.name.toUpperCase()}
            </p>
          </Tooltip>

          {data?.name &&
          (data?.cpf || data?.cnpj) &&
          data?.birthdate &&
          data?.phone ? (
            <Tooltip title="Cadastro Atualizado">
              <div className="bg-emerald-400/20 col-span-2 text-emerald-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
                <div className="h-3 w-3 bg-emerald-400 rounded-2xl"></div>
                <p className="text-sm font-bold">Atualizado</p>
              </div>
            </Tooltip>
          ) : (
            <Tooltip title="cliente com cadastro incompleto">
              <div className="relative bg-amber-400/20 col-span-2 text-yellow-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
                <div>
                  <AlertSvg />
                </div>
                <p className="text-sm font-bold">Alerta</p>
                <div className="absolute top-0 left-0 w-0 h-0 border-4 border-solid border-transparent border-t-4 border-rose-400"></div>
              </div>
            </Tooltip>
          )}

          {data.cpf ? (
            <p className="text-black/70 text-sm text-left font-bold col-span-2">
              {data.cpf ? formatToCPF(data.cpf) : ' --/--/--'}
            </p>
          ) : (
            <p className="text-black/70 text-sm text-left font-bold col-span-2">
              {data.cnpj ? formatToCPF(data.cnpj) : ' --/--/--'}
            </p>
          )}

          <p className="text-black/70 text-left text-sm font-bold col-span-2">
            {data.phone ? formatToPhone(data.phone) : '--/--/--'}
          </p>

          <div className="flex flex-row gap-3 col-span-2 mr-8">
            <div className="font-semibold text-base text-gray/50 col-span-2">
              <Grid container>
                <Grid item xs={5}>
                  <FormControl sx={{ minWidth: 80, marginRight: 8 }}>
                    <InputLabel id="demo-simple-select-autowidth-label">
                      Poltrona
                    </InputLabel>
                    <Select
                      labelId="accent-select-label"
                      id="accent-select"
                      value={selectedAcento}
                      label="Acento"
                      onChange={handleChange}
                    >
                      {/*@ts-ignore */}
                      {[...accent, parseInt(selectedAcento)]
                        .sort((a, b) => a - b)
                        .map((acento) => (
                          <MenuItem key={acento} value={acento}>
                            {acento}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </div>

            <button
              onClick={handleDelete}
              className="bg-gray/10 px-5 py-2 rounded-3xl text-black/50 text-sm flex flex-row gap-2 items-center justify-center transition hover:shadow-md hover:bg-gray/20 hover:text-gray/70"
            >
              <TrashSvg size="20" />
              <p className="font-bold col-span-2">Remover</p>
            </button>
          </div>
        </div>
      </Grid>
    </motion.div>
  );
}
export default CardPassageiros;
