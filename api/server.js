import Fastify from 'fastify';

const server = Fastify({ logger: true });

server.get('/', async (req, res) => (
  { hello: 'world' }
));

async function start() {
  try {
    await server.listen(process.env.PORT || 3000);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
