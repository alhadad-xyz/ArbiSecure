import React from 'react';
import { formatCostUSD } from '@/lib/gasCalculations';

interface SavingsComparisonProps {
  stylusCostUSD: number;
  solidityCostUSD: number;
  savingsPercent: number;
  dealAmount?: number;
}

export default function SavingsComparison({
  stylusCostUSD,
  solidityCostUSD,
  savingsPercent,
  dealAmount,
}: SavingsComparisonProps) {
  const savingsUSD = solidityCostUSD - stylusCostUSD;

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">💡</span>
            You Saved {Math.round(savingsPercent)}%
          </h3>
          <p className="text-slate-400 text-sm mt-2">vs Traditional Solidity Contracts</p>
        </div>
        <div className="bg-emerald-500/20 rounded-lg px-3 py-2">
          <p className="text-emerald-400 text-sm font-bold">{Math.round(savingsPercent)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Stylus Cost */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-500/20">
          <p className="text-emerald-400 text-xs font-semibold mb-2">ARBITRUM STYLUS</p>
          <p className="text-white text-lg font-bold">{formatCostUSD(stylusCostUSD)}</p>
          <p className="text-slate-500 text-xs mt-2">WASM - Optimized</p>
        </div>

        {/* Solidity Cost */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
          <p className="text-slate-400 text-xs font-semibold mb-2">ETHEREUM SOLIDITY</p>
          <p className="text-white text-lg font-bold">{formatCostUSD(solidityCostUSD)}</p>
          <p className="text-slate-500 text-xs mt-2">EVM - Standard</p>
        </div>
      </div>

      {/* Savings Summary */}
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-sm">Total Savings</p>
            <p className="text-emerald-400 text-2xl font-bold">{formatCostUSD(savingsUSD)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">Per transaction</p>
            {dealAmount && (
              <p className="text-slate-300 text-xs mt-1">
                Deal: {dealAmount} ETH
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="text-slate-400 text-xs mt-4">
        Arbitrum Stylus WebAssembly contracts are significantly more gas-efficient than traditional EVM Solidity contracts, resulting in lower transaction costs and faster confirmations.
      </p>
    </div>
  );
}
