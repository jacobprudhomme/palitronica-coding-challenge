import Fastify from 'fastify';
import fastifyPostgres from 'fastify-postgres';

const server = Fastify({ logger: true });

server.register(fastifyPostgres, {
  connectionString:
    `postgres://${process.env.DB_USER || 'postgres'}@${process.env.DB_HOST || 'db'}/${process.env.DB_NAME || 'palitronica'}`,
});

server.get('/', async (req, _) => {
  const dbClient = await server.pg.connect();
  const { rows } = await dbClient.query(
      'SELECT username FROM customers WHERE id=$1',
      [req.params.id],
    );
  dbClient.release();

  return rows;
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
