/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { React, SetStateAction, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { Controller } from 'react-hook-form';
import { PageWrapper } from '../../../../components/PageWrapper';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../../components/Input';
import { Select } from '../../../../components/Select';
import { DatePicker, Space } from 'antd';

// import FiltroClientes from './filtroClientes';

//@ts-ignore
import { ReactComponent as TrashSvg } from '../../../../assets/svgs/trash-solid.svg';
//@ts-ignore
import { ReactComponent as AlertSvg } from '../../../assets/svgs/alert.svg';
//@ts-ignore
import { ReactComponent as PenToSquareSvg } from '../../../assets/svgs/pen-to-square-solid.svg';
//@ts-ignore
import { ReactComponent as ArrowRightSolidSvg } from '../../../../assets/svgs/arrow-right-solid.svg';

//@ts-ignore
import customParseFormat from 'dayjs/plugin/customParseFormat';
//@ts-ignore
import { ReactComponent as PlusSvg } from '../../../../assets/svgs/plus-solid.svg';
//@ts-ignore
import dayjs from 'dayjs';

import { getAddressByPostalCode } from '../../../../helpers/get-address-by-postal-code';
import { ICustomer } from '../../../../@types/costumer';
import { toast } from 'react-toastify';
// import locale from 'antd/es/date-picker/locale/pt_BR';
// import { Datepicker } from '../../../../components/Datepicker';
import { IAddress } from '../../../../@types/address';
import { IPassenger } from '../../../../@types/passenger';
import { Loader } from '../../../../components/Loader';
import { ITrip } from '../../../../@types/trips';
import { useFetch } from '../../../../hooks/useFetch';
import { Popup } from '../../../../components/Popup';
import { CustomersSelect } from '../../../../components/CustomersSelect';
import CardPassageiros from './cardPassageiros';
import { NotFound } from '../../../../components/NotFound';

const SCHEMA = z.object({
  nomeViagem: z.string().min(1, 'Campo obrigatório!'),
  description: z.string().min(2, 'Preencha este campo'),
  startAddress: z.string().optional(),
  cidadeInicial: z.string().min(1, 'Preencha este campo'),
  numberInicial: z.string().optional(),
  estadoInicial: z.string().min(1, 'Preencha este campo'),
  bairroInicial: z.string().nullable().optional(),
  countryInicial: z.string().optional(), // país
  endAddress: z.string().optional(), // cep
  cidadeFinal: z.string().min(1, 'Preencha este campo!'), // cidade
  numberFinal: z.string().optional(), // número
  estadoFinal: z.string().min(1, 'Preencha este campo!'), // estado
  bairroFinal: z.string().nullable().optional(), // rua
  countryFinal: z.string().optional(), // país
  startDate: z.date(),
  endDate: z.date(),

  type: z.enum(['SCHEDULED', 'CHARTER', 'UNIVERSITY']), // tipo

  vehicle: z.string().min(1, 'Preencha este campo'), // veículo

  passengers: z
    .array(
      z
        .object({
          seat: z.string(), // assento
          customer: z.string(), // passageiro / cliente
        })
        .optional(),
    )
    .optional(),
});

const CUSTOMER_SCHEMA = z.object({
  name: z.string().min(1, 'Preencha o nome do seu cliente!'),
  cpf: z.string().min(14, 'Preencha um CPF válido!').optional(),
  birthdate: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

interface Passenger extends ICustomer {
  seat: number | string;
}

const trips: React.FC = () => {
  const { api } = useFetch();
  const navigate = useNavigate();

  const Form = useForm({
    resolver: zodResolver(SCHEMA),
  });

  const CustomerForm = useForm({
    resolver: zodResolver(CUSTOMER_SCHEMA),
  });

  const [isCustomerLoading, setIsCustomerLoading] = useState(false);
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);

  const [accent, setAccent] = useState<number[]>();
  const quarentaAcentos = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  ];

  const quarentaEDoisAcentos = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42,
  ];
  const quarentaETresAcentos = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43,
  ];
  const cinquentaAcentos = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  ];

  // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  //   22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  //   41, 42, 43, 44, 45, 46, 47, 48, 49, 50,

  const handleRegisterCustomer = async () => {
    try {
      setIsCustomerLoading(true);

      //@ts-ignore
      const customer = (await new Promise((resolve, reject) =>
        //@ts-ignore
        CustomerForm.handleSubmit(resolve, reject)(),
      )) as z.infer<typeof CUSTOMER_SCHEMA>;

      const birthdate: string | Date | null = CustomerForm.getValues(
        'birthdate',
      ) as string;

      if (birthdate) {
        //@ts-ignore
        const parts = birthdate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) || [];
        const date = new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
        //@ts-ignore
        if (!date || isNaN(date)) {
          CustomerForm.setError('birthdate', {
            message: 'Preencha uma data válida!',
          });
          throw new Error();
        } else {
          customer.birthdate = date.toISOString();
        }
      }

      const { data } = await api.post('/customers', customer, {
        validateStatus: () => true,
      });

      if (data.UIDescription) {
        return toast.error(data.UIDescription);
      }

      if (!data._id) throw new Error();

      setIsCustomerModalVisible(false);

      validaCliente(data as ICustomer);
    } catch (e) {
      console.log(e);
      toast.error('Verifique todos os campos e tente novamente!');
    } finally {
      setIsCustomerLoading(false);
    }
  };

  dayjs.extend(customParseFormat);

  const [loading, setLoading] = useState(false);

  const style = {
    estilo: {
      marginTop: 25,
    },
    estiloII: {
      marginTop: 34,
    },
  };

  const [passageiros, setPassageiros] = useState([] as Array<Passenger>);
  const [countryInicial, setCountryInicial] = useState<string>('Brasil');
  const [countryFinal, setCountryFinal] = useState<string>('Brasil');
  const [veiculos, setVeiculos] = useState({});
  const [startAddress, setStartAddress] = useState({} as IAddress);
  const [endAddress, setEndAddress] = useState({} as IAddress);
  const [startDateErro, setStartDateErro] = useState('');
  const [endDateErro, setEndDateErro] = useState('');

  async function getCustumerById(customerId: string) {
    try {
      const buscaApi = await api.get(`/customers/${customerId}`);
      return buscaApi;
    } catch (error) {
      console.log('erro ao buscar cliente', error);
      return [];
    }
  }

  useEffect(() => {
    //Aqui se for editar, só serve para setar os campos
    if (!location.pathname.includes('cadastrar')) {
      (async () => {
        setLoading(true);
        try {
          const tripsId = `${location.pathname.split('/')[2]}`;
          const data = await api.get(`/trips/${tripsId}`);
          const passengers: IPassenger[] = data?.data?.passengers || [];

          if (data?.data._id) {
            if (data?.data.name) {
              Form.setValue('nomeViagem', data?.data.name);
            }

            if (data?.data?.startDate) {
              setStartDate(dayjs(data?.data?.startDate));
            }

            if (data?.data.endDate) {
              setEndDate(dayjs(data?.data?.endDate));
            }

            if (data?.data.type) {
              Form.setValue('type', data?.data.type);
            }

            if (data?.data.vehicle) {
              const vehicleId = data?.data.vehicle;
              Form.setValue('vehicle', vehicleId);

              if (vehicleId) {
                const fetchVehicleDetails = async () => {
                  let pegaVeiculo;
                  try {
                    const vehicleDetails = await api.get(
                      `/vehicles/${vehicleId}`,
                    );
                    pegaVeiculo = vehicleDetails?.data?.name;
                    return pegaVeiculo.trim();
                  } catch (error) {
                    console.error('Error fetching vehicle details:', error);
                  }
                };
                const buscaVehicle = await fetchVehicleDetails();

                if (buscaVehicle) {
                  if (
                    buscaVehicle === 'MASTER IXN' ||
                    buscaVehicle === 'MASTER IYT' ||
                    buscaVehicle === 'MASTER IZR'
                  ) {
                    // console.log('50 lugares');
                    setAccent(cinquentaAcentos);
                  }

                  if (buscaVehicle === 'MICRO VERDE') {
                    // console.log('50 lugares');
                    setAccent(cinquentaAcentos);
                  }

                  if (
                    buscaVehicle === 'DD DOURADO' ||
                    buscaVehicle === 'TRUCADO' ||
                    buscaVehicle === 'BRANCO' ||
                    buscaVehicle === 'DD VERMELHO' ||
                    buscaVehicle === 'DD VERDE' ||
                    buscaVehicle === 'DD VERDE'
                  ) {
                    console.log('40 lugares');
                    setAccent(quarentaAcentos);
                  }

                  if (buscaVehicle === 'LARANJA') {
                    // console.log('42 lugares');
                    setAccent(quarentaEDoisAcentos);
                  }

                  if (buscaVehicle === 'DD AZUL') {
                    // console.log('43 lugares');
                    setAccent(quarentaETresAcentos);
                  }
                }
              }
            }

            if (data?.data.description) {
              Form.setValue('description', data?.data.description);
            }

            if (data?.data.startAddress.postalCode) {
              Form.setValue('startAddress', data?.data.startAddress.postalCode);
            }

            if (data?.data.startAddress.city) {
              Form.setValue('cidadeInicial', data?.data.startAddress.city);
            }

            if (data?.data.startAddress.number) {
              Form.setValue('numberInicial', data?.data.startAddress.number);
            }

            if (data?.data.startAddress.country) {
              Form.setValue('countryInicial', data?.data.startAddress.country);
            }

            if (data?.data.startAddress.state) {
              Form.setValue('estadoInicial', data?.data.startAddress.state);
            }

            if (data?.data?.startAddress?.street) {
              Form.setValue('bairroInicial', data?.data?.startAddress?.street);
            }

            if (data?.data.endAddress.postalCode) {
              Form.setValue('endAddress', data?.data.endAddress.postalCode);
            }

            if (data?.data.endAddress.city) {
              Form.setValue('cidadeFinal', data?.data.endAddress.city);
            }

            if (data?.data.endAddress.number) {
              Form.setValue('numberFinal', data?.data.endAddress.number);
            }

            if (data?.data.endAddress.country) {
              Form.setValue('countryFinal', data?.data.endAddress.country);
            }

            if (data?.data.endAddress.state) {
              Form.setValue('estadoFinal', data?.data.endAddress.state);
            }

            if (data?.data.endAddress.street) {
              Form.setValue('bairroFinal', data?.data.endAddress.street);
            }

            if (data?.data.endAddress.country) {
              Form.setValue('countryFinal', data?.data?.endAddress?.country);
              setCountryFinal(data?.data?.endAddress?.country);
            }
          }
          // console.log('passenger?.customer', passengers);
          const clientes: Passenger[] = [];
          // console.log('1');

          await Promise.all(
            passengers.map((passenger) => {
              return getCustumerById(passenger?.customer).then((response) => {
                clientes.push({ ...response?.data, seat: passenger?.seat });
                setAccent((prevState) => {
                  const ajustaPoltronasOcupadas = prevState.filter(
                    (item) => item != passenger?.seat,
                  );
                  return ajustaPoltronasOcupadas;
                });
              });
            }),
          );

          // console.log('clientes ====>', clientes);
          setPassageiros(clientes);
        } catch (e) {
          console.log(e);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  useEffect(() => {
    const getVeiculos = async () => {
      try {
        const data = await api.get('/vehicles');
        setVeiculos(data?.data?.data);
      } catch (error) {
        console.log(error);
      }
    };

    // Chama a função getVeiculos apenas uma vez quando o componente é montado
    getVeiculos();
  }, []);

  const [startDate, setStartDate] = useState<dayjs.Dayjs | undefined>(
    undefined,
  );
  const [endDate, setEndDate] = useState<dayjs.Dayjs | undefined>(undefined);

  // Aqui vai ser onde tiraas demais informações para setar apenas id e seat

  const heandleAddTrip = async () => {
    setLoading(true);
    if (!startDate) {
      setStartDateErro('Data Obrigatória');
    }

    if (!endDate) {
      setEndDateErro('Data Obrigatória');
    }

    if (
      startDate > endDate &&
      startDate !== !startDate &&
      endDate !== !endDate
    ) {
      setEndDateErro(
        'Data de retorno não pode ser anterior a da data de saida.',
      );
      toast.error('Ajuste a data de retorno.');
      setLoading(false);
      return;
    }

    const hasError = await new Promise((resolve) =>
      Form.handleSubmit(
        (d) => {
          // console.log('false d=>', d);
          return resolve(false);
        },
        (d) => {
          // console.log('true d=>', d);
          return resolve(true);
        },
        // () => resolve(true),
      )(),
    );

    try {
      const streetInicial = Form?.getValues('bairroInicial');
      const streetFinal = Form?.getValues('bairroFinal');

      const tripData: ITrip | any = {
        name: Form?.getValues('nomeViagem'),
        description: Form?.getValues('description'),
        startAddress: {
          postalCode: Form?.getValues('startAddress'),
          city: Form?.getValues('cidadeInicial'),
          number: Form?.getValues('numberInicial'),
          state: Form?.getValues('estadoInicial'),
          street: streetInicial != null ? streetInicial : '',
          country: Form?.getValues('countryInicial'),
        },
        endAddress: {
          postalCode: Form?.getValues('endAddress'),
          city: Form?.getValues('cidadeFinal'),
          number: Form?.getValues('numberFinal'),
          state: Form?.getValues('estadoFinal'),
          street: streetFinal != null ? streetFinal : 'Brasil',
          country: Form?.getValues('countryFinal'),
        },
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        type: Form?.getValues('type'),
        //@ts-ignore
        vehicle: document.getElementById('vehicle').value,
        passengers: [],
      };
      if (passageiros) {
        passageiros.forEach((passageiro) => {
          tripData?.passengers.push({
            seat: passageiro?.seat ? passageiro?.seat.toString() : '',
            customer: passageiro?._id,
          });
        });
      }

      try {
        if (location.pathname.includes('cadastrar')) {
          await api.post('/trips', tripData);
        } else {
          await api.put(`/trips/${location.pathname.split('/')[2]}`, tripData);
        }

        Form.reset();

        Form.setValue('nomeViagem', '');
        Form.setValue('description', '');
        Form.setValue('startAddress', '');
        Form.setValue('cidadeInicial', '');
        Form.setValue('numberInicial', '');
        Form.setValue('estadoInicial', '');
        Form.setValue('enderecoInicial', '');
        Form.setValue('countryInicial', '');
        Form.setValue('endAddress', '');
        Form.setValue('cidadeFinal', '');
        Form.setValue('numberFinal', '');
        Form.setValue('estadoFinal', '');
        Form.setValue('enderecoFinal', '');
        Form.setValue('countryInicial', countryInicial);
        Form.setValue('countryFinal', '');
        Form.setValue('bairroInicial', '');
        Form.setValue('bairroFinal', '');

        setStartDate(undefined);
        setEndDate(undefined);

        if (location.pathname.includes('cadastrar')) {
          toast.success('Viagem adicionada com sucesso!');
        } else {
          toast.success('Viagem editada com sucesso!');
        }
        navigate('/trips'); // não esqueça de me descomentar !!!!!1!!!!!!
      } catch (error) {
        console.error('Erro ao adicionar viagem:', error);
        if (!location.pathname.includes('cadastrar')) {
          toast.error(
            'Erro ao editar viagem. Verifique os dados e tente novamente.',
          );
        } else {
          toast.error(
            'Erro ao adicionar viagem. Verifique os dados e tente novamente.',
          );
        }
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const validaCliente = (customer: ICustomer) => {
    //filtro o accent deixando o número usado indispinível
    // console.log('cheguei aqui');
    // console.log('passageiros', passageiros);

    // -----------------------

    if (accent.length == 0) {
      toast.error('Sem poltronas disponíveis!');
      return;
    }

    const filtraAccent = accent.filter((item) => item != accent[0]);
    // console.log('filtraAccent', filtraAccent);
    // PRECISA VERIFICAR SE TEM ACENTOS DISPONÍVEIS ANTES DE ADICIONAR MAIS CLIENTES

    const passageiro: Passenger = {
      ...customer,
      seat: accent[0],
    };

    setAccent(filtraAccent);
    setPassageiros((prevState) => [...prevState, passageiro]);
    toast.success('Adicionado a lista com sucesso!');
  };

  const ajustAccentAutomatically = (data: any) => {
    // console.log('entrei no ajustAccentAutomatically');
    const novaPoltrona: any = parseInt(data?.banco); // 5
    const poltronaLiberada: any = data?.cliente?.seat; // 4

    // REVISAR
    if (data?.banco == data?.cliente?.seat) {
      // tira o numero da lista
      const filtro: any = accent.filter((item) => item != novaPoltrona);
      setAccent(filtro);
    }

    if (data?.banco != data?.cliente?.seat) {
      const atualizaAccent = [...accent, poltronaLiberada];
      atualizaAccent.sort((a, b) => a - b);
      const removeAccent = atualizaAccent.filter(
        (item) => item != novaPoltrona,
      );
      setAccent(removeAccent);
    }
    data.cliente.seat = novaPoltrona;
    setPassageiros((prevState) => {
      prevState = prevState.filter((item) => item._id != data.cliente._id);
      return [...prevState, data.cliente];
    });
  };

  const handleDelete = (customer: any) => {
    // Filtra os passageiros removendo o cliente com o ID correspondente
    // remove o passageiro
    const updatedPassageiros: any = passageiros.filter(
      (passenger: Passenger) => passenger._id !== customer._id,
    );

    setAccent((prevState) => {
      prevState.push(parseInt(customer?.seat));
      prevState.sort((a, b) => a - b);
      return prevState;
    });
    // aqui o seat do cliente que deletei tem que ser '' vazio

    setPassageiros(updatedPassageiros);
  };

  useEffect(() => {
    if (startAddress?.cep) {
      Form.setValue('startAddress', startAddress?.cep);
      Form.setValue('cidadeInicial', startAddress?.nome_localidade);
      Form.setValue('estadoInicial', startAddress?.uf);
      Form.setValue('bairroInicial', startAddress?.bairro);
      Form.setValue(
        'enderecoInicial',
        startAddress?.tipo_logradouro + ' ' + startAddress?.nome_logradouro,
      );
    }
  }, [startAddress]);

  useEffect(() => {
    if (endAddress.cep) {
      Form.setValue('endAddress', endAddress?.cep);
      Form.setValue('cidadeFinal', endAddress?.nome_localidade);
      Form.setValue('estadoFinal', endAddress?.uf);
      Form.setValue('bairroFinal', endAddress?.bairro);
      Form.setValue(
        'enderecoFinal',
        endAddress?.tipo_logradouro + ' ' + endAddress?.nome_logradouro,
      );
    }
  }, [endAddress]);

  return (
    <>
      <title>Cadastro de Viagem | VDR Petri - Turismo e Viagens</title>
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
                    {location.pathname.includes('cadastrar')
                      ? 'Cadastro de Viagem'
                      : 'Atualizar Viagem'}
                  </h1>
                  <p className="mt-1.5 text-sm text-black/50">
                    {location.pathname.includes('cadastrar')
                      ? 'Aqui você pode ver cadastrar as informações da sua viagem.'
                      : 'Aqui você pode ver editar as informações da sua viagem.'}
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
                    onClick={() => navigate('/notas/cadastrar')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-gray-500 transition  hover:scale-105 hover:shadow-xl focus:outline-none focus:ring hover:border-primary hover:text-primary hover:bg-primary/05"
                    type="button"
                  >
                    <span className="text-sm font-medium">Cadastrar Notas</span>

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
                    onClick={() => navigate('/trips')}
                    className="block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
                    type="button"
                  >
                    Lista de Viagens
                  </button>
                </div>
              </motion.div>
            </div>

            <div
              style={{ height: 0.2 }}
              className="bg-stone-300 rounded-lg my-8"
            ></div>
            <>
              <Grid container spacing={2}>
                <Grid xs={12} style={{ marginTop: 25, marginLeft: 15 }}>
                  <p className="font-bold text-base">Informações iniciais</p>
                </Grid>
                <Grid item xs={8}>
                  <div className="flex flex-col col-span-6">
                    <label className="block text-base font-medium text-black/70">
                      Nome da Viagem
                    </label>
                    <Input
                      type="text"
                      placeholder="Uruguai"
                      label="nomeViagem"
                      name="nomeViagem"
                      form={Form}
                      schema={SCHEMA}
                    />
                  </div>
                </Grid>

                <Grid item xs={4}>
                  <div className="flex flex-col col-span-6">
                    <label className="block text-base font-medium text-black/70">
                      Tipo de viagem
                    </label>
                    <Controller
                      name="type"
                      control={Form.control}
                      defaultValue="SCHEDULED"
                      render={({ field }) => (
                        <Select
                          id="type"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="SCHEDULED">Viagem Programada</option>
                          <option value="CHARTER">Fretamento</option>
                          <option value="UNIVERSITY">
                            Viagem de Universidade
                          </option>
                        </Select>
                      )}
                    />
                  </div>
                </Grid>

                <Grid item xs={6} style={{ marginTop: -2 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', marginTop: -15 }}>
                      <div style={{ marginRight: '30%' }}>
                        <label className="block text-base font-medium text-black/70 mt--1">
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
                        backgroundColor: '#F8F8F8',
                      }}
                      format="DD/MM/YYYY"
                      value={[startDate, endDate]}
                      onChange={(
                        dates: [
                          dayjs.Dayjs | undefined,
                          dayjs.Dayjs | undefined,
                        ],
                      ) => {
                        const dataSaida = dates[0];
                        const dataRetorno = dates[1];

                        if (dataSaida && dataRetorno != '') {
                          setStartDate(dataSaida);
                          setEndDate(dataRetorno);
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
                      defaultValue=""
                      render={({ field }) => (
                        <Select
                          id="vehicle"
                          value={field.value}
                          onChange={(e) => {
                            const selectedText =
                              e.target.options[e.target.selectedIndex].text;
                            const parts = selectedText.split(' - ');
                            const capturePlate = parts[0];
                            const verificaAcentos = (acentos: number[]) => {
                              if (passageiros.length > acentos.length) {
                                toast.error(
                                  'Sem poltronas disponíveis, tem mais passageiros que acento',
                                );
                                return;
                              } else {
                                const ajustaPoltronasNewOnibus = (
                                  acentos: any,
                                ) => {
                                  const poltronasUsadas = passageiros.map(
                                    (item: any) => parseInt(item.seat),
                                  );

                                  const poltronasDisponiveis = acentos.filter(
                                    (poltrona: any) =>
                                      !poltronasUsadas.includes(poltrona),
                                  );

                                  return poltronasDisponiveis;
                                };
                                const ajustaAcentos =
                                  ajustaPoltronasNewOnibus(acentos);

                                // console.log('ajustaAcentos', ajustaAcentos);

                                // console.log('acentos antes do set', acentos);
                                // console.log('setPassageiros', passageiros);

                                setAccent(ajustaAcentos);
                                toast.success('Alterado veiculo');
                                field.onChange(e.target.value);
                              }
                            };

                            if (
                              capturePlate !== 'MASTER IYT' &&
                              capturePlate !== 'MASTER IXN' &&
                              capturePlate !== 'MASTER IZR' &&
                              capturePlate !== 'MICRO VERDE' &&
                              capturePlate !== 'DD DOURADO' &&
                              capturePlate !== 'TRUCADO' &&
                              capturePlate !== 'BRANCO' &&
                              capturePlate !== 'DD VERMELHO' &&
                              capturePlate !== 'DD VERDE' &&
                              capturePlate !== 'DD VERDE' &&
                              capturePlate !== 'LARANJA' &&
                              capturePlate !== 'DD AZUL'
                            ) {
                              // setAccent(cinquentaAcentos);
                              verificaAcentos(cinquentaAcentos);
                            } else {
                              if (
                                capturePlate === 'MASTER IXN' ||
                                capturePlate === 'MASTER IYT' ||
                                capturePlate === 'MASTER IZR'
                              ) {
                                // console.log('3 lugares');

                                // setAccent(cinquentaAcentos);
                                verificaAcentos(cinquentaAcentos);
                              }

                              if (capturePlate === 'MICRO VERDE') {
                                // console.log('3 lugares');

                                // setAccent(cinquentaAcentos);
                                verificaAcentos(cinquentaAcentos);
                              }
                              if (
                                capturePlate === 'DD DOURADO' ||
                                capturePlate === 'TRUCADO' ||
                                capturePlate === 'BRANCO' ||
                                capturePlate === 'DD VERMELHO' ||
                                capturePlate === 'DD VERDE' ||
                                //@ts-ignore
                                capturePlate === 'DD VERDE'
                              ) {
                                // console.log('40 lugares');

                                // setAccent(quarentaAcentos);
                                verificaAcentos(quarentaAcentos);
                              }

                              if (capturePlate === 'LARANJA') {
                                // console.log('42 lugares');

                                // setAccent(quarentaEDoisAcentos);
                                verificaAcentos(quarentaEDoisAcentos);
                              }

                              if (capturePlate === 'DD AZUL') {
                                // console.log('43 lugares');

                                // setAccent(quarentaETresAcentos);
                                verificaAcentos(quarentaETresAcentos);
                              }
                            }
                          }}
                        >
                          {Array.isArray(veiculos) && veiculos.length > 0 ? (
                            veiculos.map((item: any) => (
                              <option key={item._id} value={item._id}>
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

                <Grid item xs={12}>
                  <div className="flex flex-col col-span-12">
                    <label className="block text-base font-medium text-black/70">
                      Descrição/Observação
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Viagem sem horário definido"
                      name="description"
                      label="description"
                      form={Form}
                      schema={SCHEMA}
                    />
                  </div>
                </Grid>

                <Grid xs={12} style={{ marginTop: 25, marginLeft: 15 }}>
                  <p className="font-bold text-base">Partida</p>
                </Grid>

                <Grid item xs={4}>
                  <div className="flex flex-col col-span-6">
                    <label className="block text-base font-medium text-black/70">
                      Cep Inicial
                    </label>
                    <Input
                      type="text"
                      maxLength={8}
                      inputMode="numeric"
                      placeholder="98400-000"
                      mask="cep"
                      label="startAddress"
                      name="startAddress"
                      form={Form}
                      schema={SCHEMA}
                      onChange={async (e) => {
                        try {
                          if (e.target.value.replace(/\D/g, '').length != 8) {
                            return;
                          }
                          const address = await getAddressByPostalCode(
                            e.target.value,
                          );

                          setStartAddress(address);
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    />
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="flex flex-col col-span-3">
                    <label className="block text-base font-medium text-black/70">
                      Cidade
                    </label>
                    <Input
                      type="text"
                      maxLength={25}
                      inputMode="numeric"
                      placeholder="Frederico Westphalen"
                      label="cidadeInicial"
                      form={Form}
                      schema={SCHEMA}
                    />
                  </div>
                </Grid>

                <Grid item xs={4}>
                  <div className="flex flex-col col-span-3">
                    <label className="block text-base font-medium text-black/70">
                      Estado
                    </label>
                    <Input
                      type="text"
                      maxLength={25}
                      inputMode="numeric"
                      placeholder="RS"
                      label="estadoInicial"
                      form={Form}
                      schema={SCHEMA}
                    />
                  </div>
                </Grid>

                <Grid item xs={4}>
                  <div className="flex flex-col col-span-6">
                    <label className="block text-base font-medium text-black/70">
                      País
                    </label>
                    <Input
                      type="text"
                      maxLength={25}
                      inputMode="numeric"
                      placeholder="Brasil"
                      label="countryInicial"
                      value={countryInicial}
                      form={Form}
                      schema={SCHEMA}
                      onChange={(e) => setCountryInicial(e.target.value)}
                    />
                  </div>
                </Grid>

                <Grid item xs={4}>
                  <div className="flex flex-col col-span-6">
                    <label className="block text-base font-medium text-black/70">
                      N° do Endereço
                    </label>
                    <Input
                      type="text"
                      maxLength={25}
                      inputMode="numeric"
                      placeholder="1234"
                      label="numberInicial"
                      form={Form}
                      schema={SCHEMA}
                    />
                  </div>
                </Grid>

                <Grid item xs={4}>
                  <div className="flex flex-col col-span-6">
                    <label className="block text-base font-medium text-black/70">
                      Bairro
                    </label>
                    <Input
                      type="text"
                      maxLength={25}
                      inputMode="text"
                      placeholder="Centro"
                      label="bairroInicial"
                      form={Form}
                      schema={SCHEMA}
                    />
                  </div>
                </Grid>

                <Grid xs={12} style={{ marginTop: 25, marginLeft: 15 }}>
                  <p className="font-bold text-base">Destino</p>
                </Grid>

                <Grid item xs={4}>
                  <div className="flex flex-col col-span-6">
                    <label className="block text-base font-medium text-black/70">
                      Cep Final
                    </label>
                    <Input
                      maxLength={8}
                      type="text"
                      placeholder="9860-0000"
                      mask="cep"
                      label="endAddress"
                      name="endAddress"
                      form={Form}
                      schema={SCHEMA}
                      onChange={async (e) => {
                        try {
                          if (e.target.value.replace(/\D/g, '').length != 8) {
                            return;
                          }
                          const adddress = await getAddressByPostalCode(
                            e.target.value,
                          );

                          setEndAddress(adddress);
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    />
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="flex flex-col col-span-3">
                    <label className="block text-base font-medium text-black/70">
                      Cidade
                    </label>
                    <Input
                      type="text"
                      maxLength={25}
                      inputMode="numeric"
                      placeholder="Santo Cristo"
                      label="cidadeFinal"
                      form={Form}
                      schema={SCHEMA}
                    />
                  </div>
                </Grid>

                <Grid item xs={4}>
                  <div className="flex flex-col col-span-3">
                    <label className="block text-base font-medium text-black/70">
                      Estado
                    </label>
                    <Input
                      type="text"
                      maxLength={25}
                      inputMode="numeric"
                      placeholder="RS"
                      label="estadoFinal"
                      form={Form}
                      schema={SCHEMA}
                    />
                  </div>
                </Grid>

                <Grid item xs={4}>
                  <div className="flex flex-col col-span-6">
                    <label className="block text-base font-medium text-black/70">
                      País
                    </label>
                    <Input
                      type="text"
                      maxLength={25}
                      inputMode="numeric"
                      placeholder="Brasil"
                      label="countryFinal"
                      value={countryFinal}
                      form={Form}
                      schema={SCHEMA}
                      onChange={(e) => setCountryFinal(e.target.value)}
                    />
                  </div>
                </Grid>

                <Grid item xs={4}>
                  <div className="flex flex-col col-span-6">
                    <label className="block text-base font-medium text-black/70">
                      N° do Endereço
                    </label>
                    <Input
                      type="text"
                      maxLength={25}
                      inputMode="numeric"
                      placeholder="1234"
                      label="numberFinal"
                      form={Form}
                      schema={SCHEMA}
                    />
                  </div>
                </Grid>

                <Grid item xs={4}>
                  <div className="flex flex-col col-span-6">
                    <label className="block text-base font-medium text-black/70">
                      Bairro
                    </label>
                    <Input
                      type="text"
                      maxLength={25}
                      inputMode="text"
                      placeholder="Centro"
                      label="bairroFinal"
                      form={Form}
                      schema={SCHEMA}
                    />
                  </div>
                </Grid>
              </Grid>
              <Grid container spacing={2} style={style.estilo}>
                <Grid xs={12} style={{ marginLeft: 15 }}>
                  <p className="font-bold text-base">Lista de passageiros</p>
                </Grid>

                <Grid item xs={12}>
                  <div className="flex flex-col col-span-12">
                    <div className="flex flex-row w-full gap-2 ">
                      <CustomersSelect
                        onSelect={(customer) => {
                          validaCliente(customer);
                        }}
                      />
                      <button
                        onClick={() => setIsCustomerModalVisible(true)}
                        className=" flex items-center gap-3 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
                      >
                        Cadastrar
                        <PlusSvg />
                      </button>
                    </div>

                    {passageiros.length < 1 && (
                      <div className="w-full flex items-center justify-center mt-5">
                        <NotFound
                          title="Nenhum passageiro encontrado!"
                          subtitle="Nenhum passageiro foi cadastrado para essa viagem."
                          cta={{
                            text: 'Adicionar',
                            onClick: () => setIsCustomerModalVisible(true),
                          }}
                        />
                      </div>
                    )}

                    {passageiros.length > 0 && (
                      <>
                        <div className="flex flex-col gap-4 mt-12">
                          <div className="grid grid-cols-12">
                            <p className="font-semibold text-base text-gray/50 col-span-2">
                              Nome
                            </p>
                            <p className="font-semibold text-base text-gray/50 col-span-2">
                              Status
                            </p>
                            <p className="font-semibold text-base text-gray/50 col-span-2">
                              CPF / CNPJ
                            </p>
                            <p className="font-semibold text-base text-gray/50 col-span-2">
                              Telefone
                            </p>
                            <p className="font-semibold text-base text-gray/50 col-span-2">
                              Poltrona
                            </p>
                            <p className="font-semibold text-base text-gray/50 col-span-2">
                              Ações
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex flex-col gap-2 mt-4">
                      {passageiros.map((cliente: any) => {
                        return (
                          <>
                            <CardPassageiros
                              key={cliente._id}
                              data={cliente}
                              accent={accent}
                              onDelete={(customerId) =>
                                handleDelete(customerId)
                              }
                              onAdjustAccent={(poltrona) => {
                                ajustAccentAutomatically(poltrona);
                              }}
                            />
                          </>
                        );
                      })}
                    </div>
                  </div>
                </Grid>
              </Grid>

              <Grid
                item
                style={{
                  display: 'flex',
                  flexDirection: 'row-reverse',
                  marginTop: 25,
                }}
              >
                <button
                  onClick={() => {
                    // console.log('sdfsdfsdfdfs', Form.getValues());
                    //@ts-ignore
                    // Form.handleSubmit(heandleAddTrip, (e) => console.log(e))();
                    heandleAddTrip();
                  }}
                  disabled={loading}
                  className="
                flex items-center gap-3 rounded-lg
                 bg-primary px-5 py-3 text-sm font-medium
                 text-white transition hover:scale-105
                 hover:shadow-xl focus:outline-none focus:ring"
                  type="button"
                >
                  {!loading && (
                    <>
                      {!location.pathname.includes('cadastrar')
                        ? 'Atualizar'
                        : 'Cadastrar'}
                      <ArrowRightSolidSvg />
                    </>
                  )}

                  {loading && (
                    <div className="px-4">
                      <Loader size={16} stroke={3} color="#fff" />
                    </div>
                  )}
                </button>
              </Grid>
            </>
          </div>
        </div>
      </PageWrapper>

      <Popup
        isVisible={isCustomerModalVisible}
        onClickOutside={() => setIsCustomerModalVisible(false)}
      >
        <div
          style={{ width: '50vw' }}
          className="rounded-xl bg-white shadow-lg pt-8 px-8 pb-6"
          role="alert"
        >
          <div className="flex flex-col gap-0.5">
            <p className="font-medium sm:text-xl">Cadastro Rápido</p>
            <p className="text-gray/70 text-sm">
              Cadastre seus clientes aqui rapidamente.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-4 mt-4">
            <div className="flex flex-col col-span-6">
              <label className="block text-base font-medium text-black/70">
                Nome
              </label>
              <Input
                type="text"
                placeholder="José Carlos de Oliveira"
                label="name"
                form={CustomerForm}
                schema={CUSTOMER_SCHEMA}
              />
            </div>

            <div className="flex flex-col col-span-6">
              <label className="block text-base font-medium text-black/70">
                Email
              </label>
              <Input
                type="text"
                placeholder="exemplo@exemplo.com"
                label="email"
                form={CustomerForm}
                schema={CUSTOMER_SCHEMA}
              />
            </div>

            <div className="flex flex-col col-span-4">
              <label className="block text-base font-medium text-black/70">
                CPF
              </label>
              <Input
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                label="cpf"
                mask="cpf"
                form={CustomerForm}
                schema={CUSTOMER_SCHEMA}
              />
            </div>

            <div className="flex flex-col col-span-4">
              <label className="block text-base font-medium text-black/70">
                Data de Nascimento
              </label>

              <Input
                mask="date"
                type="text"
                maxLength={10}
                placeholder="00/00/0000"
                label="birthdate"
                form={CustomerForm}
                schema={CUSTOMER_SCHEMA}
              />
            </div>

            <div className="flex flex-col col-span-4">
              <label className="block text-base font-medium text-black/70">
                Telefone
              </label>
              <Input
                type="text"
                placeholder="(99) 99999-9999"
                label="phone"
                mask="phone"
                maxLength={15}
                form={CustomerForm}
                schema={CUSTOMER_SCHEMA}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-row justify-between">
            <button
              disabled={isCustomerLoading}
              className="inline-block w-full rounded-lg border border-gray/30 text-gray/70 px-5 py-3 text-center text-sm font-semibold sm:w-auto"
            >
              Cancelar
            </button>

            <button
              disabled={isCustomerLoading}
              onClick={() => handleRegisterCustomer()}
              className="inline-block w-full rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
            >
              {isCustomerLoading ? (
                <Loader color="#fff" size={16} className="px-6" stroke={6} />
              ) : (
                'Cadastrar'
              )}
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default trips;
