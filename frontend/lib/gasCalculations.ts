// Gas cost calculations and comparative analysis
// Stylus (WASM) on Arbitrum vs Solidity on Ethereum

type GasMetrics = {
  gasUsed: number;
  gasPrice: number; // in Gwei
  txCost: number; // in ETH
  txCostUSD: number; // in USD
};

type GasComparison = {
  stylus: GasMetrics;
  solidity: GasMetrics;
  savingsPercent: number;
  savingsUSD: number;
};

// Typical gas costs for common operations on Arbitrum Stylus vs Solidity
const OPERATION_GAS_COSTS = {
  // Arbitrum Stylus (WASM) costs
  stylus: {
    createDeal: 45000,
    deposit: 28000,
    release: 32000,
    dispute: 35000,
    resolve: 40000,
  },
  // Ethereum Solidity costs (for comparison)
  solidity: {
    createDeal: 120000,
    deposit: 85000,
    release: 95000,
    dispute: 110000,
    resolve: 125000,
  },
};

/**
 * Calculate exact gas cost for a transaction
 */
export function calculateGasCost(
  gasUsed: number,
  gasPriceGwei: number,
  ethPriceUSD: number = 2500
): GasMetrics {
  const gasPrice = gasPriceGwei;
  const txCostEth = (gasUsed * gasPriceGwei) / 1e9;
  const txCostUSD = txCostEth * ethPriceUSD;

  return {
    gasUsed,
    gasPrice,
    txCost: txCostEth,
    txCostUSD,
  };
}

/**
 * Calculate gas cost for a specific operation
 */
export function getOperationGasCost(
  operationType: keyof typeof OPERATION_GAS_COSTS.stylus,
  gasPriceGwei: number = 0.1, // Arbitrum average
  ethPriceUSD: number = 2500
): GasComparison {
  const stylusGas = OPERATION_GAS_COSTS.stylus[operationType];
  const solidityGas = OPERATION_GAS_COSTS.solidity[operationType];

  const stylusCost = calculateGasCost(stylusGas, gasPriceGwei, ethPriceUSD);
  const solidityCost = calculateGasCost(solidityGas, 45, ethPriceUSD); // Ethereum mainnet typical gas price

  const savingsUSD = solidityCost.txCostUSD - stylusCost.txCostUSD;
  const savingsPercent = (savingsUSD / solidityCost.txCostUSD) * 100;

  return {
    stylus: stylusCost,
    solidity: solidityCost,
    savingsPercent,
    savingsUSD,
  };
}

/**
 * Format gas cost for display
 */
export function formatGasCost(costEth: number): string {
  if (costEth < 0.00001) {
    return `${(costEth * 1e9).toFixed(2)} Gwei`;
  }
  if (costEth < 0.01) {
    return `${(costEth * 1e6).toFixed(2)} µETH`;
  }
  return `${costEth.toFixed(6)} ETH`;
}

/**
 * Format USD cost for display
 */
export function formatCostUSD(costUSD: number): string {
  if (costUSD < 0.01) {
    return `$${costUSD.toFixed(4)}`;
  }
  return `$${costUSD.toFixed(2)}`;
}

/**
 * Get typical transaction costs per deal type
 */
export function getDealTransactionCosts(
  dealAmount: number, // in ETH
  ethPriceUSD: number = 2500,
  gasPriceGwei: number = 0.1
) {
  const operations = ['createDeal', 'deposit', 'release'] as const;
  
  const totalStylusGas = operations.reduce(
    (sum, op) => sum + OPERATION_GAS_COSTS.stylus[op],
    0
  );
  
  const totalSolidityGas = operations.reduce(
    (sum, op) => sum + OPERATION_GAS_COSTS.solidity[op],
    0
  );

  const stylusCost = calculateGasCost(totalStylusGas, gasPriceGwei, ethPriceUSD);
  const solidityCost = calculateGasCost(totalSolidityGas, 45, ethPriceUSD);

  const savingsUSD = solidityCost.txCostUSD - stylusCost.txCostUSD;
  const savingsPercent = (savingsUSD / solidityCost.txCostUSD) * 100;
  const savingsPercentOfDeal = (stylusCost.txCostUSD / (dealAmount * ethPriceUSD)) * 100;

  return {
    dealAmount,
    dealAmountUSD: dealAmount * ethPriceUSD,
    stylusTotalGas: totalStylusGas,
    solidityTotalGas: totalSolidityGas,
    stylusCost,
    solidityCost,
    savingsUSD,
    savingsPercent,
    savingsPercentOfDeal,
    operations: operations.map((op) => ({
      name: op,
      stylusGas: OPERATION_GAS_COSTS.stylus[op],
      solidityGas: OPERATION_GAS_COSTS.solidity[op],
    })),
  };
}

/**
 * Get historical data for chart
 */
export function getGasComparisonData(ethPriceUSD: number = 2500) {
  const dealSizes = [1, 2.5, 5, 10, 25];

  return dealSizes.map((dealAmount) => {
    const costs = getDealTransactionCosts(dealAmount, ethPriceUSD);
    return {
      dealAmount,
      stylusCost: Math.round(costs.stylusCost.txCostUSD * 100) / 100,
      solidityCost: Math.round(costs.solidityCost.txCostUSD * 100) / 100,
      savings: Math.round((costs.solidityCost.txCostUSD - costs.stylusCost.txCostUSD) * 100) / 100,
      savingsPercent: Math.round(costs.savingsPercent),
    };
  });
}
