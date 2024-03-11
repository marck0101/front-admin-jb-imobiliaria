interface IOwner {
  cpf?: string;
  cnpj?: string;
  corporateName: string;
  ie: string;
  uf: string;
  type: '0' | '1' | '2';
}

export interface IVehicle {
  _id: string;

  name: string;
  manufacturingYear: number;
  modelYear: number;
  mmv: string;

  taf: string;

  color: string;

  renavam: string;
  licensePlate: string;
  uf: string;
  type: '1' | '2';

  owner: IOwner;

  createdAt: string;
  updatedAt: string;
  archivedAt: string;
}
