/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
//@ts-ignore
import { toast } from 'react-toastify';
//@ts-ignore
import { ReactComponent as AlertSvg } from '../../../assets/svgs/alert.svg';
//@ts-ignore
import { ReactComponent as PenToSquareSvg } from '../../../assets/svgs/pen-to-square-solid.svg';
//@ts-ignore
import { ReactComponent as TrashSvg } from '../../../assets/svgs/trash-solid.svg';
import { motion } from 'framer-motion';
import { api } from '../../../helpers/api';
import { useEffect, useState } from 'react';
import { Loader } from '../../../components/Loader';
import { NotFound } from '../../../components/NotFound';
import { Tooltip } from '@mui/material';
import { Popup } from '../../../components/Popup';
import { PageWrapper } from '../../../components/PageWrapper';
import { ITrip } from '../../../@types/trips';
import { Pagination } from '../../../components/Pagination';
import * as dayjs from 'dayjs';

const PAGE_SIZE = 10;
interface DisplayProps {
  page?: number;
  status?: 'autorizado' | 'cancelado' | null;
  since?: string | null;
  to?: string | null;
  name?: string | null;
}
interface DataApiProps {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: string;
  vehicle: string;
  passengers: string;
  createdAt: string;
  updatedAt: string;
}
const ListaViagem = () => {
  const navigate = useNavigate();
  const [dataAPI, setDataAPI] = useState([] as Array<DataApiProps>);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [trip, setTrip] = useState<null | string>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const display = async (
    { page }: DisplayProps = {
      page: 1,
    },
  ) => {
    setIsLoading(true);
    try {
      const url = `/trips?limit=${PAGE_SIZE}&skip=${
        PAGE_SIZE * ((page || 1) - 1)
      }&`;

      const { data } = await api.get(url);
      setDataAPI(data.data);
      setTotal(data.count);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    display();
  }, []);

  const handleChangePage = (page: number): void => {
    display({ page });
    setCurrentPage(page);
  };
  const handleAskToDelete = (_id: string) => {
    setTrip(_id);
    setIsPopupVisible(true);
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/trips/${trip}`);
      if (!response.data) throw new Error();

      if (response.data) {
        toast('Viagem excluída com sucesso!', {
          type: 'success',
          autoClose: 1500,
        });
        display(); // ou é trips
      } else {
        toast('Não foi possível deletar!', {
          type: 'error',
          autoClose: 1500,
        });
        setIsPopupVisible(false);
      }
      setIsPopupVisible(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleEdit = (_id: string) => {
    navigate(`/trips/${_id}`);
  };

  return (
    <>
      <title>Viagens | VDR Petri - Turismo e Viagens</title>
      <PageWrapper>
        <div>
          <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-16 lg:px-16">
            <div className="sm:flex sm:items-center sm:justify-between">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
              >
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    Lista de Viagens
                  </h1>
                  <p className="mt-1.5 text-sm text-black/50">
                    Aqui você pode visualizar suas viagens cadastradas
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
              >
                <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
                  {/* Botar botaozão aqui */}
                  <button
                    onClick={() => navigate('/calendario')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-gray-500 transition  hover:scale-105 hover:shadow-xl focus:outline-none focus:ring hover:border-primary hover:text-primary hover:bg-primary/05"
                    type="button"
                  >
                    <span className="text-sm font-medium">Calendário</span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigate('/trips/cadastrar')}
                    className="block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition  hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
                    type="button"
                  >
                    Cadastrar Viagem
                  </button>
                </div>
              </motion.div>
            </div>
            <div
              style={{ height: 0.2 }}
              className="bg-stone-300 rounded-lg my-8"
            ></div>
            <>
              {isLoading && (
                <div className="w-full flex items-center justify-center mt-16">
                  <Loader />
                </div>
              )}

              {!isLoading && dataAPI?.length < 1 && (
                <NotFound title="Nenhuma viagem encontrada!" />
              )}

              {!isLoading && dataAPI?.length >= 1 && (
                <div>
                  <div className="grid grid-cols-12">
                    <p className="font-semibold text-base text-gray/50 col-span-2">
                      Viagem
                    </p>
                    <p className="font-semibold text-base text-gray/50 col-span-2">
                      Status
                    </p>
                    <p className="font-semibold text-base text-gray/50 col-span-2">
                      Destino
                    </p>
                    <p className="font-semibold text-base text-gray/50 col-span-2">
                      Data
                    </p>
                    <p className="font-semibold text-base text-gray/50 col-span-4">
                      Ações
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 mt-4">
                    {dataAPI.map((viagem: DataApiProps | any) => (
                      <Card
                        key={viagem._id}
                        onDelete={handleAskToDelete}
                        onEdit={handleEdit}
                        data={viagem}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>

            <div className="flex flex-row justify-between items-center mt-8">
              <p className="text-sm text-slate-500">
                {(currentPage - 2) * PAGE_SIZE > 0
                  ? (currentPage - 1) * PAGE_SIZE
                  : 1}{' '}
                -{' '}
                {currentPage * PAGE_SIZE < total
                  ? currentPage * PAGE_SIZE
                  : total}{' '}
                de {total} Viagens
              </p>

              {total > 3 && (
                <Pagination
                  onPageChange={handleChangePage}
                  totalCount={total}
                  siblingCount={1}
                  currentPage={currentPage}
                  pageSize={PAGE_SIZE}
                />
              )}

              <p className="text-transparent">Viagens por página</p>
            </div>
          </div>
        </div>
      </PageWrapper>

      <Popup
        isVisible={isPopupVisible}
        onClickOutside={() => setIsPopupVisible(false)}
      >
        <div
          className="rounded-2xl border-l-8 border-red-500 bg-white p-4 shadow-lg sm:p-6 lg:p-8"
          role="alert"
        >
          <div className="flex items-center gap-4">
            <span className="shrink-0 rounded-full bg-red-500 p-2 text-white">
              <svg
                className="h-4 w-4"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                height="1em"
                viewBox="0 0 64 512"
              >
                <path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V320c0 17.7 14.3 32 32 32s32-14.3 32-32V64zM32 480a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
              </svg>
            </span>

            <p className="font-medium sm:text-xl">
              Tem certeza que deseja remover essa viagem?
            </p>
          </div>

          <p className="mt-4 text-gray/70">
            Tem certeza que deseja remover essa viagem? Essa ação é irreversível
            e você não tera mais acesso a essa viagem.
          </p>

          <div className="mt-6 sm:flex sm:gap-4">
            <button
              onClick={() => setIsPopupVisible(false)}
              className="inline-block w-full rounded-lg bg-gray/30 text-white px-5 py-3 text-center text-sm font-semibold sm:w-auto"
            >
              Cancelar
            </button>

            <button
              onClick={handleDelete}
              className="inline-block w-full rounded-lg bg-red-500 px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
            >
              Quero deletar essa viagem
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};
export default ListaViagem;

interface CardProps {
  data: ITrip;
  onDelete: (_id: string) => void;
  onEdit: (_id: string) => void;
}

function Card({ data, onDelete, onEdit }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="grid grid-cols-12 items-center justify-center w-full rounded-2xl bg-white shadow-sm border border-slate-200 py-5">
        <Tooltip
          title={
            data?.name
              ? data?.name.toUpperCase()
              : data?.description.toUpperCase()
          }
        >
          <p className="text-black/70 text-sm text-left font-bold col-span-2 ml-8 truncate pr-4">
            {data?.name
              ? data?.name.toUpperCase()
              : data?.description.toUpperCase()}
          </p>
        </Tooltip>

        {data?.name &&
        data?.startAddress?.city &&
        data?.endAddress?.city &&
        data?.startDate ? (
          <Tooltip title="Informações complestas">
            <div className="bg-emerald-400/20 col-span-2 text-emerald-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
              <div className="h-3 w-3 bg-emerald-400 rounded-2xl"></div>
              <p className="text-sm font-bold">Atualizado</p>
            </div>
          </Tooltip>
        ) : (
          <Tooltip title="Informações incompletas">
            <div className="relative bg-amber-400/20 col-span-2 text-yellow-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
              <div>
                <AlertSvg />
              </div>
              <p className="text-sm font-bold">Alerta</p>
              <div className="absolute top-0 left-0 w-0 h-0 border-4 border-solid border-transparent border-t-4 border-rose-400"></div>
            </div>
          </Tooltip>
        )}

        {data?.endAddress?.city ? (
          <p className="text-black/70 text-sm text-left font-bold col-span-2">
            {data?.endAddress?.city ? data?.endAddress?.city : ' --/--/--'}
          </p>
        ) : (
          <p className="text-black/70 text-sm text-left font-bold col-span-2">
            --/--/--
          </p>
        )}

        <p className="text-black/70 text-left text-sm font-bold col-span-2">
          {data?.startDate
            ? new Date(data?.startDate).toLocaleDateString('pt-br')
            : '--/--/--'}
        </p>

        <div className="flex flex-row gap-3 col-span-2 mr-8">
          <button
            onClick={() => onEdit(data?._id)}
            className="bg-gray/10 px-5 py-2 rounded-3xl text-black/50 text-sm  flex flex-row gap-2 items-center justify-center transition hover:shadow-md hover:bg-gray/20 hover:text-gray/70"
          >
            <PenToSquareSvg />
            <p className="text-sm font-bold col-span-2">Editar</p>
          </button>
          <button
            onClick={() => onDelete(data?._id)}
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
