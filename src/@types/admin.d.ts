export interface IAdmin {
  _id: string;

  name: string;
  email: string;
  password: string;

  status: 'ACTIVE' | 'PENDING' | 'BLOCKED';

  createdAt: string;
  updatedAt: string;
  archivedAt: string;
}
