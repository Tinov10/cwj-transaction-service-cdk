import { Length } from 'class-validator';

export interface OrderItem {
  order_id: string;
  product_id: string;
  name: string;
  price: string;
  item_qty: number;
  image_url: string;
  created_at: string;
}

export interface TransactionInput {
  id: string;
  amount: number;
  amount_received: number;
  capture_method: string;
  created: number;
  currency: string;
  customer: string;
  payment_method: string;
  payment_method_types: string[];
  status: string;
}

export class RawOrderInput {
  transaction: TransactionInput;
  @Length(1)
  userId: string;
  items: OrderItem[];
}
