import { Client } from 'pg';

export const DBClient = () => {
  const client = new Client({
    host: 'xxxxxxxxxx.eu-central-1.compute.amazonaws.com',
    user: 'transaction_service',
    database: 'xxxxxx',
    password: 'xxxxxxx',
    port: 5432,
  });
  console.log(client);
  return client;
};
