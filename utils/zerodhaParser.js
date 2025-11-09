const xlsx = require('xlsx');

const parseZerodhaStatement = (buffer) => {
  try {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    let totalCapitalGains = 0;
    let totalCapitalLoss = 0;
    const transactions = [];

    data.forEach(row => {
      const quantity = parseInt(row['Qty'] || row['Quantity'] || 0);
      const buyPrice = parseFloat(row['Avg. Cost'] || row['Buy Price'] || 0);
      const sellPrice = parseFloat(row['Price'] || row['Sell Price'] || 0);
      const symbol = row['Instrument'] || row['ISIN'] || '';

      if (quantity > 0 && sellPrice > 0) {
        const gain = (sellPrice - buyPrice) * quantity;
        if (gain > 0) totalCapitalGains += gain;
        else totalCapitalLoss += Math.abs(gain);

        transactions.push({
          symbol,
          quantity,
          buyPrice,
          sellPrice,
          capitalGain: gain
        });
      }
    });

    return {
      capitalGains: Math.round(totalCapitalGains),
      capitalLoss: Math.round(totalCapitalLoss),
      transactions,
      source: 'Zerodha'
    };
  } catch (error) {
    throw new Error(`Zerodha parsing failed: ${error.message}`);
  }
};

module.exports = { parseZerodhaStatement };
