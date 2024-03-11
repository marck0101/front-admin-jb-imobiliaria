/* eslint-disable @typescript-eslint/no-unused-vars */
//@ts-ignore
import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
//@ts-ignore
import { api } from '../../../../../helpers/api';

interface BuscaClientesProps {
  onGetClient: (client: Cliente | null) => void;
}

interface Cliente {
  name: string;
}

const CustomListbox = React.forwardRef<
  HTMLUListElement,
  { children: React.ReactNode }
>(
  //@ts-ignore
  function CustomListbox(props, ref) {
    const { children, ...other } = props;
    return (
      <ul ref={ref} {...other} style={{ maxHeight: 200, overflowY: 'auto' }}>
        {children}
      </ul>
    );
  },
);

const BusaClientes = ({ onGetClient }: BuscaClientesProps) => {
  //@ts-ignore
  const [nome, setNome] = useState<string>('');
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    buscaClientes();
  }, []); // Executar apenas uma vez no carregamento inicial

  const buscaClientes = async () => {
    try {
      const buscaApi = await api.get('/customers/');
      const clientes: Cliente[] = buscaApi.data.data;
      setClientes(clientes);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Autocomplete
            options={clientes}
            getOptionLabel={(cliente: Cliente) => cliente.name}
            onChange={(_, value: Cliente | null) => {
              if (value) {
                // console.log('Cliente selecionado:', value);
                onGetClient(value);
              } else {
                // console.log('value aqui', value)
                setNome('');
                onGetClient(value);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar Tomador"
                variant="outlined"
                onChange={(e) => setNome(e.target.value)}
              />
            )}
            // Definir o componente Listbox personalizado
            ListboxComponent={CustomListbox}
            noOptionsText="Sem clientes" // Define o texto quando não há opções
          />
        </Grid>
      </Grid>
    </>
  );
};

export default BusaClientes;
