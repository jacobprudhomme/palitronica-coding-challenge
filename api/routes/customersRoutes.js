export default async function (server, _) {
  /* GET customers */
  server.get('/customers', async (req, _) => {
    const dbClient = await server.pg.connect();
    const { rows } = await dbClient.query('SELECT * FROM customers');
    dbClient.release();

    return rows;
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
}
