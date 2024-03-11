/*eslint ignore */
import axios from 'axios';
import { IAddress } from '../@types/address';
import { env } from '../config/env';

export const getAddressByPostalCode = async (
  postalCode: string,
): Promise<Omit<IAddress, 'number'>> => {
  // console.log(`${env.API_URL}/ceps/${postalCode.replace(/\D/g, '')}`);
  const { data } = await axios.get(
    `${env.API_URL}/ceps/${postalCode.replace(/\D/g, '')}`,
    { validateStatus: () => true, timeout: 5000 },
  );
  if (!data)
    throw new Error(`cannot find address for ${postalCode} postal code`);
  return data;
};
