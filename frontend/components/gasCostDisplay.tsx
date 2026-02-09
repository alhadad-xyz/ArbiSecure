import React from 'react';
import { formatGasCost, formatCostUSD } from '@/lib/gasCalculations';

interface GasCostDisplayProps {
  gasUsed: number;
  gasPrice: number; // in Gwei
  ethPrice?: number; // in USD
  savedPercent?: number;
  layout?: 'compact' | 'full';
}

export default function GasCostDisplay({
  gasUsed,
  gasPrice,
  ethPrice = 2500,
  savedPercent = 0,
  layout = 'compact',
}: GasCostDisplayProps) {
  // Calculate costs
  const txCostEth = (gasUsed * gasPrice) / 1e9;
  const txCostUSD = txCostEth * ethPrice;

  if (layout === 'compact') {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-400 text-sm font-semibold">Gas Cost</p>
            <p className="text-white text-lg font-bold">{formatGasCost(txCostEth)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">USD equivalent</p>
            <p className="text-emerald-400 font-semibold">{formatCostUSD(txCostUSD)}</p>
          </div>
        </div>
        {savedPercent > 0 && (
          <div className="mt-3 pt-3 border-t border-emerald-500/20">
            <p className="text-emerald-300 text-sm">
              ✓ You saved <span className="font-bold">{Math.round(savedPercent)}%</span> vs Solidity
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-xl">⛽</span>
        Gas Cost Breakdown
      </h3>

      <div className="space-y-4">
        {/* Gas Used */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-700">
          <div>
            <p className="text-slate-400 text-sm">Gas Used</p>
            <p className="text-white font-semibold">{gasUsed.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Gas Price</p>
            <p className="text-white font-semibold">{gasPrice.toFixed(2)} Gwei</p>
          </div>
        </div>

        {/* Transaction Cost */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
          <p className="text-emerald-400 text-sm font-semibold mb-2">Transaction Cost</p>
          <div className="space-y-1">
            <p className="text-white text-2xl font-bold">{formatGasCost(txCostEth)}</p>
            <p className="text-emerald-300">{formatCostUSD(txCostUSD)}</p>
          </div>
        </div>

        {/* Savings */}
        {savedPercent > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-400 text-sm font-semibold mb-2">Arbitrum Stylus Savings</p>
            <p className="text-white text-xl font-bold">
              {Math.round(savedPercent)}% cheaper than Solidity
            </p>
            <p className="text-blue-300 text-sm mt-2">
              Stylus WebAssembly contracts reduce transaction costs significantly
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
