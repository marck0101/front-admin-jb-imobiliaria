export interface IRequestLogs {
  _id?: string;

  duration: number;
  baseUrl: string;
  path: string;
  url: string;
  method: string;
  hostname: string;
  ip: string;
  status: number;
  timestamp: Date;

  createdAt?: Date;
  updatedAt?: Date;
}
