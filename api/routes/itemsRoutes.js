export default async function (server, _) {
  /* GET items (BY ids) */
  server.get('/items', async (req, _) => {
    const dbClient = await server.pg.connect();
    let rows;

    if (req.query.ids) {
      const ids = req.query.ids.split(',').map(id => parseInt(id));
      const query = format('SELECT * FROM items WHERE id IN (%L)', ids);

      ({ rows } = await dbClient.query(query));
      dbClient.release();

      if (rows.length !== ids.length) {
        const returnedIds = rows.map(row => row.id);
        const missingIds = ids.filter(id => !returnedIds.includes(id));
        throw { statusCode: 404, message: `Items with ids [${missingIds.join(',')}] do not exist` };
      }
    } else {
      ({ rows } = await dbClient.query('SELECT * FROM items'));
      dbClient.release();
    }

    return rows;
  });
}
