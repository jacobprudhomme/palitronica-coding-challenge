import Fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyPostgres from 'fastify-postgres';
import format from 'pg-format';
import Taxjar from 'taxjar';

import seedData from './data/seedData.js';

import customersRoutes from './routes/customersRoutes.js';
import itemsRoutes from './routes/itemsRoutes.js';

const server = Fastify({ logger: true });

const taxjarClient = new Taxjar({
  apiKey: process.env.TAXJAR_API_KEY
});

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

// Register routes
server.register(customersRoutes);
server.register(itemsRoutes);

function parseMoney(money) {
  return parseFloat(money.slice(1).split(',').join(''));
}

server.post('/payment', async (req, _) => {
  const { customerId, itemIds, itemQty } = req.body;

  const dbClient = await server.pg.connect();

  let { rows } = await dbClient.query(
      'SELECT first, last FROM customers WHERE id=$1',
      [customerId],
    );
  if (rows.length === 0) {
    throw { statusCode: 404, message: `Customer with id ${customerId} does not exist` };
  }
  const customerName = `${rows[0].first} ${rows[0].last}`;

  ({ rows } = await dbClient.query(
      format('SELECT * FROM items WHERE id IN (%L)', itemIds)
    ));
  if (rows.length !== itemIds.length) {
    const returnedIds = rows.map(row => row.id);
    const missingIds = itemIds.filter(id => !returnedIds.includes(id));
    throw { statusCode: 404, message: `Items with ids [${missingIds.join(',')}] do not exist` };
  }
  server.log.error(rows);
  const itemPrices = rows.map(row => parseMoney(row.price));
  server.log.error(itemPrices);
  const totalItemPrices = itemPrices.map((price, i) => price * itemQty[i]);
  server.log.error(totalItemPrices);

  dbClient.release();

  const res = await taxjarClient.ratesForLocation('90210');
  const taxComponent = res.rate.combined_rate;

  // Truncated to 2 decimal points
  const totalPrice = parseFloat(
      (taxComponent * totalItemPrices.reduce(
        (acc, totalItemPrice) => acc + totalItemPrice
      ))
      .toFixed(2)
    );

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
  let query = format('INSERT INTO customers(first, last) VALUES %L', data);
  await dbClient.query(query);
  data = seedData.items.map(item => Object.values(item));
  query = format('INSERT INTO items(price) VALUES %L', data);
  await dbClient.query(query);

  dbClient.release();
}

start();
