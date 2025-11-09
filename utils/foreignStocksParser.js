const xlsx = require('xlsx');

const parseForeignStocks = (buffer) => {
  try {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    let totalCapitalGains = 0;
    const stocks = [];

    data.forEach(row => {
      const quantity = parseInt(row['Quantity'] || 0);
      const buyPriceUSD = parseFloat(row['Buy Price USD'] || row['Acquisition Price'] || 0);
      const buyExchangeRate = parseFloat(row['Buy Exchange Rate'] || 75);
      const sellPriceUSD = parseFloat(row['Sell Price USD'] || row['Sale Price'] || 0);
      const sellExchangeRate = parseFloat(row['Sell Exchange Rate'] || 75);
      const ticker = row['Ticker'] || row['Symbol'] || '';

      if (quantity > 0 && sellPriceUSD > 0) {
        const acquisitionCostINR = quantity * buyPriceUSD * buyExchangeRate;
        const saleProceedsINR = quantity * sellPriceUSD * sellExchangeRate;
        const capitalGain = saleProceedsINR - acquisitionCostINR;

        totalCapitalGains += capitalGain;

        stocks.push({
          ticker,
          quantity,
          buyPriceUSD,
          buyExchangeRate,
          sellPriceUSD,
          sellExchangeRate,
          acquisitionCostINR: Math.round(acquisitionCostINR),
          saleProceedsINR: Math.round(saleProceedsINR),
          capitalGainINR: Math.round(capitalGain)
        });
      }
    });

    return {
      capitalGains: Math.round(totalCapitalGains),
      stocks,
      source: 'Foreign Stocks'
    };
  } catch (error) {
    throw new Error(`Foreign stocks parsing failed: ${error.message}`);
  }
};

module.exports = { parseForeignStocks };
