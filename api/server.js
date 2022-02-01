import Fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyPostgres from 'fastify-postgres';
import format from 'pg-format';

import seedData from './data/seedData.js';

import customersRoutes from './routes/customersRoutes.js';
import itemsRoutes from './routes/itemsRoutes.js';

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

// Register routes
server.register(customersRoutes);
server.register(itemsRoutes);

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
