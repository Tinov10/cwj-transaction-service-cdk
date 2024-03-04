import { SQSEvent } from 'aws-lambda';

import { RawOrderInput } from '../dto/input';
import { plainToClass } from 'class-transformer';
import { ValidateError } from '../utils/errors';

import { DBOperation } from '../repository/db-operation';

const dbOperation = new DBOperation();

export const createOrderHandler = async (event: SQSEvent) => {
  const orderResponse: Record<string, unknown>[] = [];

  const promisses = event.Records.map(async (record: any) => {
    const input = plainToClass(RawOrderInput, JSON.parse(record.body));
    const errors = await ValidateError(input);

    console.log('ERRORS:', JSON.stringify(errors));

    if (!errors) {
      const {
        id, // id --> payment_id
        amount,
        amount_received,
        capture_method,
        created,
        currency,
        customer,
        payment_method,
        payment_method_types,
        status,
      } = input.transaction; // Stripe payment info

      // the creating begins: 1) transaction table 2) orders table 3) order_items table

      // create transaction
      const transactionQuery = `INSERT INTO transactions(
            amount,
            amount_received,
            capture_method,
            created,
            currency,
            customer,
            payment_id,
            payment_method,
            payment_method_types,
            status
             )
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;

      const transactionValues = [
        amount,
        amount_received,
        capture_method,
        created,
        currency,
        customer,
        id,
        payment_method,
        payment_method_types.toString(),
        status,
      ];

      // Modify db
      const transactionResult = await dbOperation.executeQuery(
        transactionQuery,
        transactionValues
      );

      // Check result after modifying
      if (transactionResult.rowCount > 0) {
        const transaction_id = transactionResult.rows[0].id;
        const order_ref_number = Math.floor(10000 + Math.random() * 900000);
        const status = 'received';
        //
        //
        // create order inside db
        const orderQuery = `INSERT INTO orders(
              user_id,
              status,
              amount,
              transaction_id,
              order_ref_id
             )
            VALUES($1,$2,$3,$4,$5) RETURNING *`;

        const orderValues = [
          Number(input.userId),
          status,
          amount,
          transaction_id,
          order_ref_number, // order_ref_id = Math.floor()
        ];
        const orderResult = await dbOperation.executeQuery(
          orderQuery,
          orderValues
        );
        const orderId = orderResult.rows[0].id;

        // create order items
        if (Array.isArray(input.items)) {
          let itemInsertPromise = Array();

          // we have received an object with an items key this is an array with items
          input.items.map((item: any) => {
            // every items gets inserted into the order_items table
            const orderItemQuery = `INSERT INTO order_items(
              order_id,
              product_id,
              name,
              image_url,
              price,
              item_qty
             )
            VALUES($1,$2,$3,$4,$5,$6) RETURNING *`;

            const orderItemValue = [
              orderId,
              item.product_id,
              item.name,
              item.image_url,
              Number(item.price),
              item.item_qty,
            ];

            itemInsertPromise.push(
              dbOperation.executeQuery(orderItemQuery, orderItemValue)
            );
          });

          await Promise.all(itemInsertPromise);
        }
      }
    } else {
      orderResponse.push({ error: JSON.stringify(errors) });
    }
  });
  await Promise.all(promisses);
  console.log('RESPONSE:', orderResponse);
  return { orderResponse };
};
