import { getRandomInt } from '../helpers/get-random-int';
import { makeCustomerMockup } from './customers';

interface Props {
  limit?: number;
}

export class Mocks {
  static customer() {
    return makeCustomerMockup();
  }

  static customers({ limit }: Props = {}) {
    return Array(limit || getRandomInt(15, 60))
      .fill(null)
      .map(makeCustomerMockup);
  }
}
