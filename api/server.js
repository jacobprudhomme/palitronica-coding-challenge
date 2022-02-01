import Fastify from 'fastify';
import fastifyPostgres from 'fastify-postgres';

const server = Fastify({ logger: true });

server.register(fastifyPostgres, {
  connectionString: process.env.DB_URL || 'postgres://postgres@postgres/postgres',
});

server.get('/customers/:id', async (req, _) => {
  const dbClient = await server.pg.connect();
  const { rows } = await dbClient.query(
      'SELECT * FROM customers WHERE id=$1',
      [req.params.id],
    );
  dbClient.release();

  if (rows.length === 0) {
    throw { statusCode: 404, message: `Customer with id ${req.params.id} does not exist` };
  } else {
    return rows;
  }
});

async function start() {
  try {
    await server.listen(process.env.PORT || 3000, '0.0.0.0');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
