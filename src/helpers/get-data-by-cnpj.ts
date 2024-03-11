import axios from 'axios';
import { env } from '../config/env';

export const getDataByCnpj = async (cnpj: string) => {
  const { data } = await axios.get(
    `${env.API_URL}/cnpjs/${cnpj.replace(/\D/g, '')}`,
    { validateStatus: () => true, timeout: 5000 },
  );
  if (!data) throw new Error(`cannot find address for ${cnpj} postal code`);
  return data;
};
