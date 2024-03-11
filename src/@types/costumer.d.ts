export interface ICustomer {
  endAddress: string;
  startAddress: string;
  startDate: string;
  _id: string;

  name: string;
  fantasyname: string;
  email: string;
  birthdate: string;
  cpf: string;
  cnpj: string;
  createdAt: string;
  phone: string;
  rg: string;
  updatedAt: string;
  address: {
    cep: string;
    city: string;
    number: string;
    state: string;
    street: string;
    bairro: string;
  };
}
