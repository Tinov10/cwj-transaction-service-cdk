import { APIGatewayEvent, Context } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { DBOperation } from '../repository/db-operation';

const dbOperation = new DBOperation();

// get all the orders AND the order items of each order of a single user
export const getOrderHandler = middy(async (event: APIGatewayEvent) => {
  const { id } = event.pathParameters as any;

  const queryString =
    'SELECT * FROM orders o INNER JOIN order_items oi ON o.id = oi.order_id WHERE user_id=$1';

  const values = [id];

  const result = await dbOperation.executeQuery(queryString, values);

  if (result.rowCount > 0) {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      statusCode: 201,
      body: JSON.stringify({ order: result.rows }),
    };
  }
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    statusCode: 404,
    body: JSON.stringify({ message: 'orders not found' }),
  };
}).use(jsonBodyParser());
