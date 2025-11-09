// backend/utils/capitalGainsCalculator.js

const calculateHoldingPeriod = (buyDate, sellDate) => {
  return Math.floor((new Date(sellDate) - new Date(buyDate)) / (1000 * 60 * 60 * 24));
};

const calculateLongTermGain = (acquisitionCost, saleProceeds, assetType, indexationFactor = 1.08) => {
  let taxableGain;
  
  if (assetType === 'indian-share' || assetType === 'mutual-fund') {
    // Shares: 20% LTCG without indexation benefit
    const ltcgTax = saleProceeds * 0.20;
    taxableGain = saleProceeds - acquisitionCost;
  } else {
    // Other assets: Benefit of indexation
    const indexedCost = acquisitionCost * indexationFactor;
    taxableGain = Math.max(0, saleProceeds - indexedCost);
  }
  
  return taxableGain;
};

const calculateShortTermGain = (saleProceeds, acquisitionCost) => {
  // Added to income, taxed per slab
  return saleProceeds - acquisitionCost;
};

const calculateTCS = (saleAmount, assetType) => {
  if (assetType === 'crypto') {
    return saleAmount * 0.01; // 1% TCS on crypto
  }
  if (assetType === 'foreign-share') {
    return saleAmount * 0.05; // 5% on foreign remittance
  }
  return 0;
};

module.exports = {
  calculateHoldingPeriod,
  calculateLongTermGain,
  calculateShortTermGain,
  calculateTCS
};
