import { faker } from '@faker-js/faker';

export const makeCustomerMockup = () => ({
  name: faker.person.firstName(),
  email: faker.internet.email(),
  rg: Math.random() > 0.5 ? faker.string.numeric(7) : undefined,

  cpf: faker.string.numeric(11),
  cnpj: faker.string.numeric(14),

  birthdate: faker.date.anytime().toISOString(),
  phone: faker.phone.number('############'),

  address: {
    cep: faker.string.numeric(8),
    city: faker.location.city(),
    state: faker.location.state(),
    street: faker.location.street(),
    number: faker.string.numeric(3),
  },

  // Cria sozinho
  _id: faker.string.uuid(),
  createdAt: faker.date.anytime().toISOString(),
  updatedAt: faker.date.anytime().toISOString(),
});
