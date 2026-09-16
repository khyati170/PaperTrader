function PortfolioRow({ stock }) {
  const { symbol, name, qty, buyPrice, currentPrice } = stock;

  const investedValue = buyPrice * qty;
  const currentValue = currentPrice * qty;
  const profit = currentValue - investedValue;
  const profitPercent = (profit / investedValue) * 100;
  const isGain = profit >= 0;

  return (
    <tr>
      <td>{symbol}</td>
      <td>{name}</td>
      <td>{qty}</td>
      <td>₹{buyPrice.toFixed(2)}</td>
      <td>₹{currentPrice.toFixed(2)}</td>
      <td>₹{currentValue.toFixed(2)}</td>
      <td style={{ color: isGain ? '#0F6E56' : '#A1442E' }}>
        {isGain ? '+' : ''}₹{profit.toFixed(2)} ({profitPercent.toFixed(2)}%)
      </td>
    </tr>
  );
}

export default PortfolioRow;