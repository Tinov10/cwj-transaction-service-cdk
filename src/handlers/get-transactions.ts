import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';

import { DBOperation } from '../repository/db-operation';

const dbOperation = new DBOperation();

// get all transactions out of the transaction table
export const getTransactionHandler = middy(async () => {
  const queryString = 'SELECT * FROM transactions LIMIT 500';
  const values: any = [];
  const result = await dbOperation.executeQuery(queryString, values);

  if (result.rowCount > 0) {
    return {
      statusCode: 201,
      body: JSON.stringify({ transactions: result.rows[0] }),
    };
  }
  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'transactions not found!' }),
  };
}).use(jsonBodyParser());
