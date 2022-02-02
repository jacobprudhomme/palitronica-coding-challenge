export function parseMoney(money) {
  return parseFloat(money.slice(1).split(',').join(''));
};

export function calculateTotalPrice(totalItemPrices, taxComponent) {
  // Truncated to 2 decimal points
  const totalPriceFull = (1 + taxComponent) * totalItemPrices.reduce(
      (acc, totalItemPrice) => acc + totalItemPrice
    );
  const totalPriceAsString = totalPriceFull.toFixed(2);
  const totalPrice = parseFloat(totalPriceAsString);

  return totalPrice;
};
