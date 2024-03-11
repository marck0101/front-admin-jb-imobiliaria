/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
// eslint-disable-next-file prettier/prettier
import {
  Autocomplete,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';

import Select, { SelectChangeEvent } from '@mui/material/Select';
import { forwardRef, ReactNode, useEffect, useState } from 'react';
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
import { api } from '../../../../helpers/api';
import { Loader } from '../../../../components/Loader';
import { NotFound } from '../../../../components/NotFound';
import { formatToCPF } from '../../../../helpers/format-to-cpf';
import { formatToPhone } from '../../../../helpers/phone';
import { ITrip } from '../../../../@types/trips';
import { toast } from 'react-toastify';
import CardPassageiros from './cardPassageiros';
// import CardPassageiros '../../CardPassageiros'

interface Cliente extends Passenger {
  name?: string;
  fantasyname?: string;
  email?: string;
  cnpj?: string;
  phone?: string;
  _id?: string;
  files?: PropFiles;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}
interface PropFiles {
  name?: string;
  size?: string;
  type?: string;
  url?: string;
  _id?: string;
}
interface Passenger {
  _id?: string;
  customer?: string;
  seat?: string;
}
interface ClienteSelecionado extends Passenger {
  nome?: string;
  fantasyname?: string;
  email?: string;
  birthdate?: string;
  cpf?: string;
  phone?: string;
  rg?: string;
  files?: [];
  address?: string;
  cliente?: Cliente;
  banco?: string;
}

const CustomListbox = forwardRef<HTMLUListElement, { children: ReactNode }>(
  function CustomListbox(props, ref) {
    const { children, ...other } = props;
    return (
      <ul ref={ref} {...other} style={{ maxHeight: 200, overflowY: 'auto' }}>
        {children}
      </ul>
    );
  },
);

interface RetornaCliente {
  onReturnClient: (client: ClienteSelecionado | any) => void;
  onReturnAccent: (accentViajante: ITrip | ClienteSelecionado) => void;
  onClickToRegisterPassanger: () => void;
}

const FiltroClientes = ({
  onReturnClient,
  onReturnAccent,
  onClickToRegisterPassanger,
}: RetornaCliente) => {
  const tripId = location.pathname.split('/')[2];

  const [clientes, setClientes] = useState([] as Array<Cliente>);
  const [passageiros, setPassageiros] = useState([] as Array<Cliente>);
  const [isLoading, setIsLoading] = useState(true);
  const [accent, setAccent] = useState([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  ]);

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

  const buscaClientes = async () => {
    try {
      const buscaApi = await api.get('/customers/');
      const clientes: Cliente[] = buscaApi.data.data;

      const filtroClientes: Cliente[] = clientes
        .filter((item: Cliente) => !item.fantasyname)
        .map((item: Cliente) => ({
          _id: item?._id,
          name: item?.name,
          email: item?.email,
          phone: item?.phone,
          files: item?.files,
          address: item?.address,
          createdAt: item?.createdAt,
          updatedAt: item?.updatedAt,
        }));

      setClientes(filtroClientes);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  // adiciona o cliente nos cards
  function handleDataCard(clienteSelecionado: any): void {
    try {
      if (clienteSelecionado !== null) {
        // Verifica se o cliente já está na lista de passageiros
        const clienteExistente: Cliente | any = passageiros.some(
          (passenger: Passenger) => passenger?._id === clienteSelecionado?._id,
        );
        if (clienteExistente) {
          toast.error('cliente já adicionado na lista');
        }
        if (!clienteExistente) {
          const adicionaCliente = [...passageiros, clienteSelecionado];

          const adicionaPltronaSeVazio = adicionaCliente.map((item: any) => {
            // Verifica se o objeto "passengers" existe e se há algum passageiro
            if (
              item.hasOwnProperty('passengers') &&
              item.passengers.length > 0
            ) {
              // Se já tem passageiros, mantém os assentos existentes
              return item;
            } else {
              // Se não tem passageiros, adiciona um novo objeto "passengers" com um assento automático
              if (item?.seat) {
                return item;
              }
              if (!item?.seat) {
                return {
                  _id: item?._id,
                  name: item?.name,
                  email: item?.email,
                  phone: item?.phone,
                  files: item?.files,
                  address: item?.address,
                  seat: accent[0],
                  createdAt: item?.createdAt,
                  updatedAt: item?.updatedAt,
                };
              }
            }
          });

          //Funlçao que vai servir para setar banco automaticamente no passageiro
          setaBancoDoPassageiro(adicionaPltronaSeVazio);
          toast.success('Passageiro adicionado!');
        }
      }
    } catch (error) {
      console.error('Ocorreu um erro:', error);
    }
  }

  // adiciona poltrona AUTOMATICAMENTE na tela
  const setaBancoDoPassageiro = (inf: Cliente[]) => {
    // pega todos que tem na tela
    setPassageiros(inf);
    const bancoEPassageiro = inf.map((item: any) => {
      return {
        cliente: item,
        banco: item?.seat.toString(),
      };
    });
    // @ts-ignore
    ajustAccentAutomatically(bancoEPassageiro.slice(-1)[0]);
  };

  const ajustAccentAutomatically = (data: any) => {
    const novaPoltrona: any = parseInt(data?.banco); // 5
    const poltronaLiberada: any = data?.cliente?.seat; // 4

    if (data?.banco == data?.cliente?.seat) {
      // tira o numero da lista
      const filtro: any = accent.filter((item) => item != novaPoltrona);
      // manda o outro numero para a lista caso tenha
      // filtro.push(poltronaLiberada);
      setAccent(filtro);
      const atualizaBancoCliente = {
        banco: poltronaLiberada,
        cliente: {
          ...data.cliente,
          seat: novaPoltrona,
        },
      };
      onReturnAccent(atualizaBancoCliente);
    }

    if (data?.banco != data?.cliente?.seat) {
      const atualizaAccent = [...accent, poltronaLiberada];
      atualizaAccent.sort((a, b) => a - b);

      const removeAccent = atualizaAccent.filter(
        (item) => item != novaPoltrona,
      );

      setAccent(removeAccent);
      // preciso retornar cliente e poltrona atualizado
      const atualizaBancoCliente = {
        banco: data.banco,
        cliente: {
          ...data.cliente,
          seat: novaPoltrona,
        },
      };

      onReturnAccent(atualizaBancoCliente);
    }
    data.cliente.seat = novaPoltrona;

    setPassageiros((prevState) => {
      prevState = prevState.filter((item) => item._id != data.cliente._id);
      return [...prevState, data.cliente];
    });
  };

  // busca infs para apresentar na tela
  const buscaViajantes = async () => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      const passengers: Passenger[] = response?.data?.passengers || [];

      const clientes: ClienteSelecionado | any = await Promise.all(
        //@ts-ignore
        passengers.map((passenger) => getCustumerById(passenger?.customer)),
      );

      const clientesComAssento: any = clientes.map((cliente: any) => {
        return {
          ...cliente,
          seat: passengers.find((p) => p.customer == cliente._id)?.seat,
        };
      });

      setPassageiros(clientesComAssento);
      // inicia as poltronas utilizadas caso tenhaa
      const acentos = clientesComAssento.map((item: any) => {
        return parseInt(item?.seat);
      });

      const filtro = accent.filter((item: any) => !acentos.includes(item));
      setAccent(filtro);
    } catch (error) {
      console.log('error', error);
    }
  };

  async function getCustumerById(customerId: string) {
    try {
      const buscaApi = await api.get(`/customers/${customerId}`);
      return buscaApi.data;
    } catch (error) {
      console.log('erro ao buscar cliente', error);
      return [];
    }
  }

  useEffect(() => {
    buscaClientes();
    buscaViajantes();
  }, []);

  useEffect(() => {
    if (passageiros) {
      onReturnClient(passageiros);
    }
  }, [passageiros]);

  return (
    <>
      <div className="flex flex-row gap-4">
        {/* Apresenta todos clientes em uma lista para selecionar */}
        <Autocomplete
          className="w-full rounded-md"
          options={clientes}
          getOptionLabel={(cliente: Cliente | any) => cliente.name}
          onChange={(_, value: Cliente | null) => {
            try {
              handleDataCard(value);
            } catch (error) {
              console.error('Erro ao lidar com a mudança:', error);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Selecionar Passageiro"
              variant="outlined"
              size="small"
            />
          )}
          //@ts-ignore
          ListboxComponent={CustomListbox}
          noOptionsText="Nenhum cliente encontrado"
        />

        <button
          onClick={() => onClickToRegisterPassanger()}
          className=" flex items-center gap-3 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
        >
          Cadastrar
          <PlusSvg />
        </button>
      </div>

      <Grid xs={12} style={{ marginTop: -25 }}>
        <div className="flex flex-col gap-4 mt-12">
          {isLoading && (
            <div className="w-full flex items-center justify-center mt-16">
              <Loader />
            </div>
          )}

          {!isLoading && passageiros.length < 1 && (
            <NotFound
              title="Nenhum passageiro encontrado!"
              subtitle="Nenhum passageiro foi cadastrado para essa viagem."
              cta={{
                text: 'Adicionar',
                onClick: () => onClickToRegisterPassanger(),
              }}
            />
          )}

          {!isLoading && passageiros.length >= 1 && (
            <div>
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

              {/* <div className="flex flex-col gap-4 mt-4">
                {passageiros.map((data: any) => (
                  <CardPassageiros
                    key={data._id}
                    data={data}
                    onDelete={(customerId) => handleDelete(customerId)}
                    adjustAccent={(poltrona) =>
                      ajustAccentAutomatically(poltrona)
                    }
                    //@ts-ignore
                    accent={accent}
                  />
                ))}
              </div> */}
            </div>
          )}
        </div>
      </Grid>
    </>
  );
};

export default FiltroClientes;
