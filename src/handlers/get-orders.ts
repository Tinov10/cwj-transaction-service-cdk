import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { DBOperation } from '../repository/db-operation';

const dbOperation = new DBOperation();

// get all orders out the orders table without joining on order_items
export const getOrdersHandler = middy(async () => {
  const queryString = 'SELECT * FROM orders LIMIT 500';
  const values: any = [];
  const result = await dbOperation.executeQuery(queryString, values);

  if (result.rowCount > 0) {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      statusCode: 201,
      body: JSON.stringify({ orders: result.rows[0] }),
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'orders not found' }),
  };
}).use(jsonBodyParser());
