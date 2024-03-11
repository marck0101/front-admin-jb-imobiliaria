import { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { generateRandomUUID } from '../helpers/generate-random-uuid';
import { getRandomInt } from '../helpers/get-random-int';
import { Mocks } from '../mocks';
import { makeCustomerMockup } from '../mocks/customers';

const DEFAULT_ERROR_RESPONSE = [
  500,
  {
    error: 'Internal Server Error',
    status: 500,
    message:
      'An unexpected error occurred while processing your request. Please try again later or contact our support team for assistance.',
  },
];

const isErrorPresent = () => Math.random() < 0.1;

const delay = async () =>
  await new Promise((r) => setTimeout(r, getRandomInt(0.5, 2.2) * 1000));

const useMock = (axios: AxiosInstance) => {
  const mock = new MockAdapter(axios);

  mock.onPost(new RegExp('/customers')).reply(async () => {
    await delay();
    if (isErrorPresent()) return DEFAULT_ERROR_RESPONSE;

    return [
      201,
      {
        _id: generateRandomUUID(),
      },
    ];
  });

  mock.onGet(new RegExp('/customers/.*')).reply(async () => {
    await delay();
    if (isErrorPresent()) return DEFAULT_ERROR_RESPONSE;

    return [200, makeCustomerMockup()];
  });

  mock.onGet(new RegExp('/customers')).reply(async () => {
    await delay();
    if (isErrorPresent()) return DEFAULT_ERROR_RESPONSE;

    const data = Mocks.customers();

    return [
      200,
      {
        data: data,
        count: getRandomInt(data.length, data.length * 3),
      },
    ];
  });
};

export default useMock;
