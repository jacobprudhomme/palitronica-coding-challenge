import Fastify from 'fastify';
import fastifyPostgres from 'fastify-postgres';
import format from 'pg-format';

const server = Fastify({ logger: true });

server.register(fastifyPostgres, {
  connectionString: process.env.DB_URL || 'postgres://postgres@postgres/postgres',
});

/* GET customer BY id */
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
    return rows[0];
  }
});

/* GET items (BY ids) */
server.get('/items', async (req, _) => {
  const dbClient = await server.pg.connect();
  let rows;

  if (req.query.ids) {
    const ids = req.query.ids.split(',').map(id => parseInt(id));
    const query = format('SELECT * FROM items WHERE id IN (%L)', ids);

    ({ rows } = await dbClient.query(query));

    if (rows.length !== ids.length) {
      const returnedIds = rows.map(row => row.id);
      const missingIds = ids.filter(id => !returnedIds.includes(id));
      throw { statusCode: 404, message: `Items with ids [${missingIds.join(',')}] do not exist` };
    }
  } else {
    ({ rows } = await dbClient.query('SELECT * FROM items'));
  }

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
