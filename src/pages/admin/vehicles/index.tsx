import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IVehicle } from '../../../@types/vehicle';
import { PageWrapper } from '../../../components/PageWrapper';

import { useFetch } from '../../../hooks/useFetch';
import { Loader } from '../../../components/Loader';
import { NotFound } from '../../../components/NotFound';
import { toast } from 'react-toastify';
import { Popup } from '../../../components/Popup';

import { motion } from 'framer-motion';
import { VehicleCard } from '../../../components/vehicles/card';

export function Vehicles() {
  const navigate = useNavigate();

  const { api } = useFetch();

  const [isLoading, setIsLoading] = useState(true);

  const [vehicles, setVehicles] = useState([] as Array<IVehicle>);
  const [vehicle, setVehicle] = useState<null | string>(null);

  const display = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data.data);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskToDelete = (_id: string) => {
    setVehicle(_id);
    setIsPopupVisible(true);
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/vehicles/${vehicle}`);
      if (response.data) {
        toast('Veículo excluído com sucesso!', {
          type: 'success',
          autoClose: 1500,
        });
        display();
      } else {
        toast('Não foi possível deletar!', {
          type: 'error',
          autoClose: 1500,
        });
      }
      setIsPopupVisible(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleEdit = (_id: string) => {
    navigate(`/veiculos/${_id}`);
  };

  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {
    display();
  }, []);

  return (
    <>
      <title>Veículos | VDR Petri - Turismo e Viagens</title>
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
                    Veículos
                  </h1>

                  <p className="mt-1.5 text-sm text-black/50">
                    Aqui você pode ver todas as informações sobre os seus
                    veículos.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
              >
                <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
                  <button
                    onClick={() => navigate('/notas')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-gray-500 transition  hover:scale-105 hover:shadow-xl focus:outline-none focus:ring hover:border-primary hover:text-primary hover:bg-primary/05"
                    type="button"
                  >
                    <span className="text-sm font-medium">Notas</span>

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
                    onClick={() => navigate('/veiculos/cadastrar')}
                    className="block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition  hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
                    type="button"
                  >
                    Cadastrar Veículo
                  </button>
                </div>
              </motion.div>
            </div>

            <div
              style={{ height: 0.2 }}
              className="bg-stone-300 rounded-lg my-8"
            ></div>

            {isLoading && (
              <div className="w-full flex items-center justify-center mt-16">
                <Loader />
              </div>
            )}

            {!isLoading && vehicles.length < 1 && (
              <NotFound title="Nenhum veículo encontrado!" />
            )}

            {!isLoading && vehicles.length >= 1 && (
              <div>
                <div className="grid grid-cols-12">
                  <p className="font-semibold text-base text-gray/50 col-span-2">
                    Nome
                  </p>
                  <p className="font-semibold text-base text-gray/50 col-span-2">
                    Status
                  </p>
                  <p className="font-semibold text-base text-gray/50 col-span-2">
                    Placa
                  </p>
                  <p className="font-semibold text-base text-gray/50 col-span-2">
                    Fretamento
                  </p>
                  <p className="font-semibold text-base text-gray/50 col-span-4">
                    Ações
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  {vehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle._id}
                      onDelete={handleAskToDelete}
                      onEdit={handleEdit}
                      data={vehicle}
                    />
                  ))}
                </div>
              </div>
            )}
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
              Tem certeza que deseja remover esse veículo?
            </p>
          </div>

          <p className="mt-4 text-gray/70">
            Tem certeza que deseja remover esse veículo? Essa ação é
            irreversível e você não tera mais acesso a esse veículo.
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
              Quero deletar esse veículo
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
}
