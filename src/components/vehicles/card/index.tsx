import { IVehicle } from '../../../@types/vehicle';

interface CardProps {
  data: IVehicle;
  onDelete: (_id: string) => void;
  onEdit: (_id: string) => void;
}

//@ts-ignore
import { ReactComponent as TrashSvg } from '../../../assets/svgs/trash-solid.svg';
//@ts-ignore
import { ReactComponent as PenToSquareSvg } from '../../../assets/svgs/pen-to-square-solid.svg';

import { motion } from 'framer-motion';

export function VehicleCard({ data, onDelete, onEdit }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="grid grid-cols-12 items-center justify-center w-full rounded-2xl bg-white shadow-sm border border-slate-200 py-5">
        <p className="text-black/70 text-sm text-left font-bold col-span-2 ml-8 truncate pr-4">
          {data.name.toUpperCase()}
        </p>

        <div className="bg-emerald-400/20 col-span-2 text-emerald-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
          <div className="h-3 w-3 bg-emerald-400 rounded-2xl"></div>
          <p className="text-sm font-bold">Dísponível</p>
        </div>

        <p className="text-black/70 text-sm text-left font-bold col-span-2">
          {data.licensePlate.toUpperCase()}
        </p>

        {/* <p className="text-black/70 text-left text-sm font-bold col-span-2">{data.uf.toUpperCase()}</p> */}

        <p className="text-black/70 text-left text-sm font-bold col-span-2 truncate pr-4">
          {data.mmv.toUpperCase()}
        </p>

        <div className="flex flex-row gap-3 col-span-2 mr-8">
          <button
            onClick={() => onEdit(data._id)}
            className="bg-gray/10 px-5 py-2 rounded-3xl text-black/50 text-sm  flex flex-row gap-2 items-center justify-center transition hover:shadow-md hover:bg-gray/20 hover:text-gray/70"
          >
            <PenToSquareSvg />
            <p className="text-sm font-bold col-span-2">Editar</p>
          </button>
          <button
            onClick={() => onDelete(data._id)}
            className="bg-gray/10 px-5 py-2 rounded-3xl text-black/50 text-sm flex flex-row gap-2 items-center justify-center transition hover:shadow-md hover:bg-gray/20 hover:text-gray/70"
          >
            <TrashSvg />
            <p className="font-bold col-span-2">Excluir</p>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
