import Fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyPostgres from 'fastify-postgres';
import format from 'pg-format';
import Taxjar from 'taxjar';

import {
  getCustomerNameFromId,
  getItemPricesFromIds,
  getTaxComponentForCustomer,
} from './helpers/queryHelpers.js';
import { calculateTotalPrice } from './helpers/utilities.js';
import seedData from './data/seedData.js';


const taxjarClient = new Taxjar({
  apiKey: process.env.TAXJAR_API_KEY
});


const server = Fastify({ logger: true });

server.register(fastifyCors, {
  origin: (origin, cb) => {
    if (/localhost/.test(origin)) {
      cb(null, true);
      return;
    }
    cb(new Error('Disallowed origin'));
  }
})
server.register(fastifyPostgres, {
  connectionString: process.env.DB_URL || 'postgres://postgres@postgres/postgres',
});


server.post('/payment', async (req, _) => {
  const { customerId, itemIds, itemQty } = req.body;

  const dbClient = await server.pg.connect();

  const customerName = await getCustomerNameFromId(dbClient, customerId);
  const itemPrices = await getItemPricesFromIds(dbClient, itemIds);
  const totalItemPrices = itemPrices.map((price, i) => price * itemQty[i]);

  dbClient.release();

  const taxComponent = await getTaxComponentForCustomer(taxjarClient, customerId);
  const totalPrice = calculateTotalPrice(totalItemPrices, taxComponent);

  return { customerName, totalItemPrices, taxComponent, totalPrice };
});


async function start() {
  try {
    await server.listen(process.env.PORT || 3000, '0.0.0.0');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  let dbClient;
  try {
    dbClient = await server.pg.connect();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  // Empty tables to start fresh
  await dbClient.query('TRUNCATE customers RESTART IDENTITY');
  await dbClient.query('TRUNCATE items RESTART IDENTITY');

  // Seed database with data
  let data = seedData.customers.map(customer => Object.values(customer));
  let query = format('INSERT INTO customers(first, last, zipCode) VALUES %L', data);
  await dbClient.query(query);
  data = seedData.items.map(item => Object.values(item));
  query = format('INSERT INTO items(price) VALUES %L', data);
  await dbClient.query(query);

  dbClient.release();
}

start();
