import { ICustomer } from './costumer';

export interface IPassenger extends ICustomer {
  customer: string;
  seat: string;
}
