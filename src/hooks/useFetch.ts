import axios from 'axios';
import { env } from '../config/env';
import { useAuth } from '../contexts/auth';
import useMock from './useMock';

export function useFetch() {
  const { user } = useAuth();

  const instance = axios.create({
    baseURL: env.API_URL,
    headers: {
      token: user.token || false,
      'ui-description': true,
      'ui-language': 'pt-br',
    },
  });

  if (env.MOCK_REQUESTS && env.BUILD != 'PROD') {
    /* eslint-disable */
    useMock(instance);
  }

  const api = instance;

  return { api }

}
