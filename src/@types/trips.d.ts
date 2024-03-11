export interface IAddress {
  postalCode: string;
  city: string;
  number: string;
  state: string;
  street: string;
  country: string;
}
export interface IPassenger {
  customer: string;
  seat: string;
}
export interface ITrip {
  _id?: string;
  name?: string;
  description?: string;

  startAddress?: IAddress;
  endAddress?: IAddress;

  startDate?: string;
  endDate?: string;

  type?: 'SCHEDULED' | 'CHARTER' | 'UNIVERSITY';

  vehicle?: string;
  passengers?: Array<IPassenger>;

  archivedAt?: string;
}

export type TripProps = Omit<
  ITrip,
  'createdAt' | 'updatedAt' | '_id' | 'archivedAt'
>;
