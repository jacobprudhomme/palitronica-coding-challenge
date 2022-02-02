import format from 'pg-format';

import { parseMoney } from './utilities.js';

export async function getCustomerNameFromId(dbClient, id) {
  const { rows } = await dbClient.query(
      'SELECT first, last FROM customers WHERE id=$1',
      [id],
    );

  if (rows.length === 0) {
    throw { statusCode: 404, message: `Customer with id ${customerId} does not exist` };
  }

  const customerName = `${rows[0].first} ${rows[0].last}`;
  return customerName;
};

export async function getItemPricesFromIds(dbClient, ids) {
  const { rows } = await dbClient.query(
      format('SELECT * FROM items WHERE id IN (%L)', ids)
    );

  if (rows.length !== ids.length) {
    const returnedIds = rows.map(row => row.id);
    const missingIds = ids.filter(id => !returnedIds.includes(id));
    throw { statusCode: 404, message: `Items with ids [${missingIds.join(',')}] do not exist` };
  }

  const itemPrices = rows.map(row => parseMoney(row.price));
  return itemPrices;
};

export async function getTaxComponentForCustomer(dbClient, taxjarClient, id) {
  const { rows } = await dbClient.query(
      'SELECT zipCode FROM customers WHERE id=$1',
      [id],
    );

  if (rows.length === 0) {
    throw { statusCode: 404, message: `Customer with id ${customerId} does not exist` };
  }

  let res;
  try {
    res = await taxjarClient.ratesForLocation(rows[0].zipcode);
  } catch (err) {
    throw { statusCode: 404, message: `${rows[0].zipcode} is not a valid or existing ZIP code` };
  }
  const taxComponent = res.rate.combined_rate;

  return taxComponent;
};
