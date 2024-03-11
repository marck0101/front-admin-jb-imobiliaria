/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

//@ts-ignore
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
//@ts-ignore
import { ReactComponent as AlertSvg } from '../../../assets/svgs/alert.svg';
// Contexts
import { useCalendar } from '../../../contexts/calendar';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/Input';
// import { Datepicker } from '../../../components/Datepicker';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Popup } from '../../../components/Popup';
import { Select } from '../../../components/Select';
import { toast } from 'react-toastify';
import { PageWrapper } from '../../../components/PageWrapper';

import { VehiclesMultipleSelect } from '../../../components/trips/VehiclesMultiSelect';
import { TripTypesMultipleSelect } from '../../../components/trips/TripTypesMultipleSelect';

// Fullcalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/core/locales/pt-br'; // arquivo de localização para português

import { motion } from 'framer-motion';
import { Controller } from 'react-hook-form';
import { Box, Card, Grid, Modal, Tooltip } from '@mui/material';
import { useFetch } from '../../../hooks/useFetch';

import { DatePicker, Space } from 'antd';

import { getHexContrastYIQ } from '../../../helpers/get-hex-contrast-yiq';

const SCHEMA = z.object({
  name: z.string().min(1, 'Campo obrigatório!'),
  nomeViagem: z.string().min(1, 'Preencha este campo'), // nome
  startDateTrip: z.date(), // data ida
  endDateTrip: z.date(), // data volta
  vehicle: z.string().min(1), // veículo
  type: z.enum(['SCHEDULED', 'CHARTER', 'UNIVERSITY']), // tipo
});

interface InfIdFiltrado {
  _id?: string;
  id?: string;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  vehicle?: string;

  startAddress?: {
    city?: string;
    state?: string;
    street?: string;
    number?: string;
  };
  endAddress?: {
    city?: string;
    state?: string;
    street?: string;
    number?: string;
  };
  passengers?: any[]; // Adjust based on passenger data structure
}

interface BuscaColor {
  color: string;
}
interface VeiculoSelecionado {
  name?: string;
  licensePlate?: string;
}

interface CalendarView {
  calendar?: any;
  start?: string;
  event?: InfIdFiltrado;
}

interface SelectInfo {
  view?: CalendarView;
  start?: string;
}

const Calendario = () => {
  const navigate = useNavigate();
  const { stateVehicles, stateTypes } = useCalendar();
  const Form = useForm({
    resolver: zodResolver(SCHEMA),
  });

  const { api } = useFetch();

  // const [currentEvents, setCurrentEvents] = useState([] as Array<CalendarView>);
  const calendarRef = useRef();

  const [isOpen, setIsOpen] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const [info, setInfo] = useState<string>('');
  const [dataTrips, setDataTrips] = useState([] as Array<InfIdFiltrado>);
  const [infIdFiltrado, setInfIdFiltrado] = useState({} as InfIdFiltrado);

  const [startDateTrip, setStartDateTrip] = useState<dayjs.Dayjs | undefined>(
    undefined,
  );
  const [startDateErro, setStartDateErro] = useState('');

  const [endDateErro, setEndDateErro] = useState('');

  const [endDateTrip, setEndDateTrip] = useState<dayjs.Dayjs | undefined>(
    undefined,
  );

  const [vehicles, setVehicles] = useState([]);
  const [veiculoSelecionado, setVeiculoSelecionado] =
    useState<VeiculoSelecionado>();
  const [mesSelected, setMesSelected] = useState<string>();

  const style = {
    position: 'absolute',
    borderRadius: 3,
    display: 'flex',
    flexWrap: 'wrap',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    height: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };
  const styleII = {
    position: 'absolute',
    borderRadius: 3,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    height: 450,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  const handleOpen = () => {
    setIsPopupVisible(true);
  };

  const handleCloseQuickRegistration = () => {
    setIsPopupVisible(false);
    Form.setValue('nomeViagem', '');
    setStartDateTrip(undefined);
    setEndDateTrip(undefined);
    setStartDateErro('');
    setEndDateErro('');
  };

  const handleDateSelect = async (
    selectInfo:
      | { view: { calendar: SelectInfo | undefined } }
      | undefined
      | any,
  ) => {
    const dataInicial = dayjs(selectInfo?.startStr).format('DD-MM-YYYY');
    const dataFinal = dayjs(selectInfo?.endStr)
      .subtract(1, 'day')
      .format('DD-MM-YYYY'); //  17-02-2024

    if (dataInicial < dataFinal) {
      setEndDateTrip(dayjs(selectInfo?.endStr).subtract(1, 'day'));
    }

    const date: SelectInfo | undefined = dayjs(selectInfo?.start);
    setStartDateTrip(date);

    if (!selectInfo || !selectInfo.view) {
      console.error('Invalid selectInfo:', selectInfo);
      return;
    }

    handleOpen();
  };

  const handleEventClick = (clickInfo: CalendarView) => {
    setIsOpen(true);
    if (clickInfo?.event?.id) {
      setInfo(clickInfo?.event?.id);
    } else {
      setInfo('');
    }
  };

  const filterId = () => {
    const filteredData = dataTrips.find((trip) => trip._id === info);

    if (filteredData?.vehicle) {
      buscaInfVehicle(filteredData?.vehicle);
    }
    if (filteredData) {
      setInfIdFiltrado(filteredData);
    }
  };

  function handleClose() {
    setIsOpen(false);
  }

  const buscaVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  function buscaCor(veiculo: string) {
    let filterCor: BuscaColor | any = vehicles.find(
      (filt: string | any) => filt?._id === veiculo,
    );
    console.log(
      'filterCor ==>',
      vehicles.find((filt: string | any) => filt?._id === veiculo),
    );

    if (
      !filterCor ||
      !filterCor?.color ||
      filterCor?.color === ('' || undefined)
    ) {
      return '#077c07'; // ou qualquer cor padrão desejada
    } else {
      return filterCor?.color;
    }
  }

  const displayCalendar = async () => {
    try {
      let response;
      if (stateVehicles.length == 0 && stateTypes.length == 0) {
        response = await api.get('/trips');
      }

      if (stateVehicles.length > 0 && stateTypes.length == 0) {
        response = await api.get(`/trips?vehicles=${stateVehicles.join()}`);
      }

      // filtra tipos de viagens, senão todos os tipos
      if (stateVehicles.length == 0 && stateTypes.length > 0) {
        response = await api.get(`/trips?types=${stateTypes.join()}`);
      }

      //  filtra veículos e tipos de viagens
      if (stateVehicles.length > 0 && stateTypes.length > 0) {
        response = await api.get(
          `/trips?vehicles=${stateVehicles.join()}&types=${stateTypes.join()}`,
        );
      }

      setDataTrips(response?.data.data); // esse cara aqui está duplicando o tipo de viagem
    } catch (error) {
      console.log(error);
    }
  };

  const ajustaDataEndTrip = (endTrip: any) => {
    const recebendoEndData = endTrip;

    const novaData = new Date(recebendoEndData);
    const novaDataEnd = novaData.setDate(novaData.getDate() + 1);

    return novaDataEnd;
  };

  const handleQuickRegistration = async () => {
    if (!startDateTrip) {
      setStartDateErro('Data Obrigatória');
    }
    if (!endDateTrip) {
      setEndDateErro('Data Obrigatória');
    }

    if (!Form.getValues('nomeViagem')) {
      setEndDateErro('Data Obrigatória');
    }

    const hasError = await new Promise((resolve) =>
      Form.handleSubmit(
        () => resolve(false),
        () => resolve(true),
      )(),
    );

    if (
      startDateTrip > endDateTrip &&
      startDateTrip !== !startDateTrip &&
      endDateTrip !== !endDateTrip
    ) {
      setEndDateErro(
        'Data de retorno não pode ser anterior a da data de saida.',
      );
      toast.error('Data de retorno não pode ser anterior a da data de saida.');
      return;
    }

    const tripData = {
      name: Form.getValues('nomeViagem'), //
      startDate: startDateTrip?.toISOString(),
      endDate: endDateTrip?.toISOString(),

      type: Form.getValues('type'),
      //@ts-ignore
      vehicle: document.getElementById('vehicle').value,
    };

    try {
      await api.post('/trips', tripData);
      Form.reset();

      Form.setValue('nomeViagem', '');
      Form.setValue('startDateTrip', '');
      Form.setValue('endDateTrip', '');
      Form.setValue('vehicle', '');
      Form.setValue('startAddressQuickRegistration', '');
      Form.setValue('endAddressQuickRegistration', '');
      Form.setValue('type', 'SCHEDULED');
      setEndDateTrip(undefined);
      setStartDateTrip(undefined);

      toast.success('Viagem adicionada com sucesso!');
      handleCloseQuickRegistration();
    } catch (error: any) {
      toast.error(error?.response?.data?.UIDescription);
      console.error('Erro ao adicionar viagem:', error);
    }
    displayCalendar();
  };

  const buscaInfVehicle = async (id: string) => {
    const response = await api.get(`vehicles/${id}`);
    setVeiculoSelecionado(response.data);
  };

  useEffect(() => {
    filterId();
  }, [info]);

  useEffect(() => {
    buscaVehicles();
  }, []);

  useEffect(() => {
    if (vehicles.length > 0) {
      displayCalendar();
    }
  }, [stateVehicles, stateTypes, vehicles]);

  // Função para capitalizar a primeira letra de uma string
  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <>
      <title>Calendário | VDR Petri - Turismo e Viagens</title>
      <PageWrapper>
        <div>
          <div className="mx-auto calendar max-w-screen-xl px-4 py-8 sm:px-6 sm:py-16 lg:px-16">
            <div className="sm:flex sm:items-center sm:justify-between">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
              >
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    Calendário
                  </h1>
                  <p className="mt-1.5 text-sm text-black/50">
                    Visualize suas viagens durante o período selecionado.
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
                    onClick={() => navigate('/trips')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-gray-500 transition  hover:scale-105 hover:shadow-xl focus:outline-none focus:ring hover:border-primary hover:text-primary hover:bg-primary/05"
                    type="button"
                  >
                    <span className="text-sm font-medium">
                      Lista de Viagens
                    </span>
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

            <Grid
              container
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                flexWrap: 'nowrap',
              }}
            >
              <Grid xs={6} style={{ marginTop: -90, marginRight: 15 }}>
                <VehiclesMultipleSelect />
              </Grid>
              <Grid xs={6} style={{ marginTop: -90 }}>
                <TripTypesMultipleSelect />
              </Grid>
            </Grid>

            <div className="demo-app" style={{ cursor: 'pointer' }}>
              <h1 style={{ fontSize: 28, marginBottom: -40 }}>{mesSelected}</h1>
              <FullCalendar
                //@ts-ignore
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                  right: 'prev,next',
                  left: '', // Deixe vazio para remover a parte esquerda do cabeçalho
                  center: '', // Deixe vazio para remover a parte central do cabeçalho
                }}
                initialView="dayGridMonth"
                eventLimit={true}
                editable={false}
                selectable={true}
                selectMirror={true}
                weekends={true}
                events={dataTrips.map((trip) => {
                  //@ts-ignore
                  const color = buscaCor(trip?.vehicle);
                  return {
                    id: trip?._id,
                    title: trip?.name,
                    start: trip?.startDate,
                    end: ajustaDataEndTrip(trip?.endDate),
                    className: 'cursor-pointer ',
                    color: color ? color : '#077c07',
                    textColor: getHexContrastYIQ(color),
                  };
                })}
                select={handleDateSelect} // click na data, cadastro rápido
                eventClick={handleEventClick} // abre detalhes da viagem
                dayMaxEvents={6} // Mostra até 6 viagens antes de aparecer ver mais
                eventLimitText="+2 mais" // Custom text for the "more events" link
                locale="pt-br" // idioma para português brasileiro
                datesSet={(arg) => {
                  const monthTitle = arg.view.title;
                  const formattedMonthTitle = capitalizeFirstLetter(monthTitle);
                  // Atualizar o título do mês no DOM
                  setMesSelected(formattedMonthTitle);
                }}
              />
            </div>
            <div>
              <Modal
                open={isOpen}
                onClose={() => handleClose()}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={styleII}>
                  <div style={{ marginTop: 10 }}>
                    {infIdFiltrado && (
                      <>
                        <h1 style={{ fontSize: 20 }}>
                          <b>{`Detalhes da Viagem: ${
                            infIdFiltrado?.name
                              ? infIdFiltrado?.name.toUpperCase()
                              : '--/--/--'
                          }`}</b>
                        </h1>
                        <small style={{ color: 'grey' }}>
                          Aqui estão listados os detalhes da sua viagem
                        </small>
                        <Grid container>
                          <Grid item xs={6} style={{ marginTop: 15 }}>
                            <h2>Data de Partida:</h2>
                            <div style={{ color: 'grey' }}>
                              {infIdFiltrado?.startDate
                                ? dayjs(infIdFiltrado?.startDate).format(
                                    'DD/MM/YY',
                                  )
                                : '--/--/--'}
                            </div>
                          </Grid>

                          <Grid item xs={6} style={{ marginTop: 15 }}>
                            <h2>Data de Retorno:</h2>
                            <div style={{ color: 'grey' }}>
                              {infIdFiltrado?.endDate
                                ? dayjs(infIdFiltrado?.endDate).format(
                                    'DD/MM/YY',
                                  )
                                : '--/--/--'}
                            </div>
                          </Grid>

                          <Grid item xs={6} style={{ marginTop: 15 }}>
                            <h2>Endereço Inicial:</h2>
                            {infIdFiltrado?.startAddress ? (
                              <>
                                <div style={{ color: 'grey' }}>
                                  {`${
                                    infIdFiltrado?.startAddress?.city
                                      ? infIdFiltrado?.startAddress?.city
                                      : '--/--/--'
                                  }, ${
                                    infIdFiltrado?.startAddress?.state
                                      ? infIdFiltrado?.startAddress?.state
                                      : '--/--/--'
                                  } - ${
                                    infIdFiltrado?.startAddress?.street
                                      ? infIdFiltrado?.startAddress?.street
                                      : '--/--/--'
                                  }, ${
                                    infIdFiltrado?.startAddress?.number
                                      ? infIdFiltrado?.startAddress?.number
                                      : '--/--/--'
                                  }`}
                                </div>
                              </>
                            ) : (
                              <>
                                <Tooltip title="Informações incompletas">
                                  <div className="relative bg-amber-400/20 col-span-2 text-yellow-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
                                    <div>
                                      <AlertSvg />
                                    </div>
                                    <p className="text-sm font-bold">
                                      Informações ainda não cadastradas
                                    </p>
                                    <div className="absolute top-0 left-0 w-0 h-0 border-4 border-solid border-transparent border-t-4 border-rose-400"></div>
                                  </div>
                                </Tooltip>
                              </>
                            )}
                          </Grid>

                          <Grid item xs={6} style={{ marginTop: 15 }}>
                            <h2>Endereço Final:</h2>
                            {infIdFiltrado?.endAddress ? (
                              <>
                                <div style={{ color: 'grey' }}>
                                  {`${
                                    infIdFiltrado?.endAddress?.city
                                      ? infIdFiltrado?.endAddress?.city
                                      : ''
                                  },
                              ${
                                infIdFiltrado?.endAddress?.state
                                  ? infIdFiltrado?.endAddress?.state
                                  : ''
                              } -
                              ${
                                infIdFiltrado?.endAddress?.street
                                  ? infIdFiltrado?.endAddress?.street
                                  : ''
                              },
                              ${
                                infIdFiltrado?.endAddress?.number
                                  ? infIdFiltrado?.endAddress?.number
                                  : ''
                              }`}
                                </div>
                              </>
                            ) : (
                              <>
                                <Tooltip title="Informações incompletas">
                                  <div className="relative bg-amber-400/20 col-span-2 text-yellow-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
                                    <div>
                                      <AlertSvg />
                                    </div>
                                    <p className="text-sm font-bold">
                                      Informações ainda não cadastradas
                                    </p>
                                    <div className="absolute top-0 left-0 w-0 h-0 border-4 border-solid border-transparent border-t-4 border-rose-400"></div>
                                  </div>
                                </Tooltip>
                              </>
                            )}
                          </Grid>

                          <Grid item xs={6} style={{ marginTop: 15 }}>
                            <h2>Nome do veiculo</h2>
                            <div style={{ color: 'grey' }}>
                              {veiculoSelecionado?.name}
                            </div>
                          </Grid>

                          <Grid item xs={6} style={{ marginTop: 15 }}>
                            <h2>Placa do veiculo</h2>
                            <div style={{ color: 'grey' }}>
                              {veiculoSelecionado?.licensePlate}
                            </div>
                          </Grid>

                          <Grid item xs={6} style={{ marginTop: 15 }}>
                            <h2>Número de Passageiros:</h2>
                            <div style={{ color: 'grey' }}>
                              {infIdFiltrado?.passengers?.length}
                            </div>
                          </Grid>
                          <Grid item xs={12}>
                            <Grid container>
                              <Grid item xs={6} style={{ marginTop: 15 }}>
                                <button
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-center gap-3 rounded-lg bg-gray/50 px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring hover:bg-gray/60"
                                  type="button"
                                >
                                  Voltar
                                </button>
                              </Grid>
                              <Grid
                                item
                                xs={6}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                  marginTop: 15,
                                }}
                              >
                                <button
                                  onClick={() =>
                                    navigate(`/trips/${infIdFiltrado?._id}`)
                                  }
                                  type="button"
                                  className="
                                  flex items-center gap-3 rounded-lg
                                  bg-primary px-5 py-3 text-sm font-medium
                                  text-white transition hover:scale-105
                                  hover:shadow-xl focus:outline-none focus:ring"
                                >
                                  Editar
                                </button>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    )}
                  </div>
                </Box>
              </Modal>
            </div>
          </div>
        </div>
      </PageWrapper>

      <Popup
        isVisible={isPopupVisible}
        onClickOutside={handleCloseQuickRegistration}
      >
        <Card sx={style}>
          <div>
            <h1 className="text-xl">
              <b>Cadastro Rápido</b>
            </h1>
            <small className="text-gray/60">
              Aqui você pode cadastrar sua viagem rapidamente
            </small>
          </div>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <div className="flex flex-col col-span-6">
                <label className="block text-base font-medium text-black/70">
                  Nome da Viagem
                </label>
                <Input
                  type="text"
                  placeholder="Uruguai"
                  label="nomeViagem"
                  name="nomeViagem"
                  //@ts-ignore
                  form={Form}
                  schema={SCHEMA}
                />
              </div>
            </Grid>

            <Grid item xs={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex' }}>
                  <div style={{ marginRight: '35%' }}>
                    <label className="block text-base font-medium text-black/70">
                      Data de Partida
                    </label>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-black/70">
                      Data de Retorno
                    </label>
                  </div>
                </div>

                <DatePicker.RangePicker
                  style={{
                    width: '100%',
                    height: '50px',
                    backgroundColor: '#FFFFFF',
                  }}
                  format="DD/MM/YYYY"
                  value={[startDateTrip, endDateTrip]}
                  onChange={(
                    dates: [dayjs.Dayjs | undefined, dayjs.Dayjs | undefined],
                  ) => {
                    const dataSaida = dates[0];
                    const dataRetorno = dates[1];

                    if (dataSaida && dataRetorno != '') {
                      setStartDateTrip(dataSaida);
                      setEndDateTrip(dataRetorno);
                    }
                  }}
                />
              </Space>
            </Grid>

            <Grid item xs={6}>
              <div className="flex flex-col col-span-6">
                <label className="block text-base font-medium text-black/70">
                  Veículo utilizado
                </label>
                <Controller
                  name="vehicle"
                  control={Form.control}
                  defaultValue="" // Defina o valor padrão aqui se necessário
                  render={({ field }) => (
                    <Select
                      id="vehicle"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {vehicles.length > 0 ? (
                        vehicles.map((item: any) => (
                          <option key={item.licensePlate} value={item._id}>
                            {item.name} - {item.licensePlate}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Sem veículos disponíveis
                        </option>
                      )}
                    </Select>
                  )}
                />
              </div>
            </Grid>

            <Grid item xs={6}>
              <div className="flex flex-col col-span-6">
                <label className="block text-base font-medium text-black/70">
                  Tipo de Viagem
                </label>
                <Controller
                  name="type"
                  defaultValue="SCHEDULED" // Defina o valor padrão aqui se necessário
                  control={Form.control}
                  render={({ field }) => (
                    <Select
                      id="type"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="SCHEDULED">Viagem Programada</option>
                      <option value="CHARTER">Fretamento</option>
                      <option value="UNIVERSITY">Viagem de Universidade</option>
                    </Select>
                  )}
                />
              </div>
            </Grid>

            <Grid item xs={6} style={{ marginTop: 15 }}>
              <button
                onClick={() => handleCloseQuickRegistration()}
                className="flex items-center gap-3 rounded-lg bg-gray/50 px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring hover:bg-gray/60"
                type="button"
              >
                Voltar
              </button>
            </Grid>

            <Grid
              item
              xs={6}
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 15,
              }}
            >
              <button
                onClick={() => handleQuickRegistration()}
                type="button"
                className="flex items-center gap-3 rounded-lg
                  bg-primary px-5 py-3 text-sm font-medium
                  text-white transition hover:scale-105
                  hover:shadow-xl focus:outline-none focus:ring"
              >
                Cadastrar
              </button>
            </Grid>
          </Grid>
        </Card>
      </Popup>
    </>
  );
};
export default Calendario;
