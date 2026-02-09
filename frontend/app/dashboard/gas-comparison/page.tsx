'use client';

import { useState } from 'react';
import Header from '@/components/header';
import { getGasComparisonData, getDealTransactionCosts, formatCostUSD } from '@/lib/gasCalculations';
import SavingsComparison from '@/components/savingsComparison';
import Link from 'next/link';

export default function GasComparison() {
  const [ethPrice] = useState(2500);
  
  const comparisonData = getGasComparisonData(ethPrice);
  const maxSolidityCost = Math.max(...comparisonData.map(d => d.solidityCost));

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-400 mb-8">
          <Link href="/dashboard" className="hover:text-slate-300 transition">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Gas Comparison</span>
        </div>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Gas Cost Analysis</h1>
          <p className="text-slate-400">
            Compare Arbitrum Stylus (WASM) efficiency with traditional Ethereum Solidity
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Average Savings</p>
            <p className="text-3xl font-bold text-emerald-400">62.5%</p>
            <p className="text-slate-500 text-xs mt-2">Across typical transactions</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Cost per Deal (5 ETH)</p>
            <p className="text-3xl font-bold text-white">
              {formatCostUSD(getDealTransactionCosts(5, ethPrice).stylusCost.txCostUSD)}
            </p>
            <p className="text-emerald-400 text-xs mt-2">
              vs {formatCostUSD(getDealTransactionCosts(5, ethPrice).solidityCost.txCostUSD)} on Ethereum
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Network</p>
            <p className="text-2xl font-bold text-white">Arbitrum One</p>
            <p className="text-slate-500 text-xs mt-2">Low-cost L2 blockchain</p>
          </div>
        </div>

        {/* Main Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Transaction Costs by Deal Size</h2>
              
              {/* Chart Area */}
              <div className="space-y-6">
                {comparisonData.map((data, idx) => {
                  const stylusWidth = (data.stylusCost / maxSolidityCost) * 100;
                  const solidityWidth = (data.solidityCost / maxSolidityCost) * 100;
                  
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">{data.dealAmount} ETH Deal</span>
                        <span className="text-emerald-400 text-sm font-bold">Save {data.savingsPercent}%</span>
                      </div>
                      
                      <div className="space-y-1">
                        {/* Stylus Bar */}
                        <div className="flex items-center gap-3">
                          <div className="w-20 text-right">
                            <p className="text-slate-400 text-xs">Stylus</p>
                          </div>
                          <div className="flex-1 relative h-8 bg-slate-900 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-emerald-500/80 flex items-center justify-end pr-3 transition-all rounded-lg"
                              style={{ width: `${stylusWidth}%` }}
                            >
                              <span className="text-white text-xs font-bold">{formatCostUSD(data.stylusCost)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Solidity Bar */}
                        <div className="flex items-center gap-3">
                          <div className="w-20 text-right">
                            <p className="text-slate-400 text-xs">Solidity</p>
                          </div>
                          <div className="flex-1 relative h-8 bg-slate-900 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-slate-500/60 flex items-center justify-end pr-3 transition-all rounded-lg"
                              style={{ width: `${solidityWidth}%` }}
                            >
                              <span className="text-white text-xs font-bold">{formatCostUSD(data.solidityCost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-700">
                <p className="text-slate-400 text-sm">
                  Data represents typical gas costs for create_deal + deposit + release operations
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <SavingsComparison
              stylusCostUSD={getDealTransactionCosts(5, ethPrice).stylusCost.txCostUSD}
              solidityCostUSD={getDealTransactionCosts(5, ethPrice).solidityCost.txCostUSD}
              savingsPercent={getDealTransactionCosts(5, ethPrice).savingsPercent}
              dealAmount={5}
            />
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden mb-12">
          <div className="p-8 bg-slate-900/50 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white">Operation Costs Breakdown</h2>
            <p className="text-slate-400 text-sm mt-2">Per-operation gas costs for a 5 ETH deal</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Operation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Stylus Gas</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Stylus Cost</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Solidity Gas</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Solidity Cost</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-400">Savings</th>
                </tr>
              </thead>
              <tbody>
                {['Create Deal', 'Deposit Funds', 'Release Funds'].map((op, idx) => {
                  const operations = getDealTransactionCosts(5, ethPrice).operations;
                  const op_data = operations[idx];
                  const stylusCost = (op_data.stylusGas * 0.1) / 1e9 * ethPrice;
                  const solidityCost = (op_data.solidityGas * 45) / 1e9 * ethPrice;
                  const savings = solidityCost - stylusCost;
                  
                  return (
                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 text-white font-medium">{op}</td>
                      <td className="px-6 py-4 text-slate-300">{op_data.stylusGas.toLocaleString()} gas</td>
                      <td className="px-6 py-4 text-emerald-400 font-semibold">{formatCostUSD(stylusCost)}</td>
                      <td className="px-6 py-4 text-slate-300">{op_data.solidityGas.toLocaleString()} gas</td>
                      <td className="px-6 py-4 text-slate-300">{formatCostUSD(solidityCost)}</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold">
                        {formatCostUSD(savings)} ({Math.round((savings / solidityCost) * 100)}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-8">
          <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            Why Stylus is More Efficient
          </h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>WASM Compilation:</strong> Stylus contracts compile to WebAssembly, which is more efficient than EVM bytecode</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Arbitrum Compression:</strong> Built-in compression reduces calldata costs</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Lower Base Fees:</strong> Arbitrum L2 has significantly lower gas prices than L1 Ethereum</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Optimized Runtime:</strong> The Arbitrum VM is optimized for Stylus bytecode execution</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
