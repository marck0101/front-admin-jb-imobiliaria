import axios from 'axios';
import { env } from '../config/env';

export const getCFOPByCode = async (code: string) => {
  const { data } = await axios.get(`${env.API_URL}/cfops/${code}`, {
    validateStatus: () => true,
    timeout: 5000,
  });
  return data[0] || null;
};
