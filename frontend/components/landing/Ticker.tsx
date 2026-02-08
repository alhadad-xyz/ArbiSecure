import React from 'react';

const TickerItem = ({ symbol, price, change, isPositive = false }: { symbol: string, price: string, change: string, isPositive?: boolean }) => (
    <span className="inline-block px-4">
        <span className="text-xs font-mono text-gray-400">
            <span className="text-white bg-white/10 px-2 py-1 rounded">{symbol}</span> {price} <span className={isPositive ? "text-green-500" : "text-red-500"}>{isPositive ? '▲' : '▼'} {change}</span>
        </span>
    </span>
);

export default function Ticker() {
    return (
        <div className="w-full border-y border-white/5 bg-white/5 backdrop-blur-sm py-2 overflow-hidden mb-12">
            <div className="w-full overflow-hidden whitespace-nowrap">
                <div className="inline-block animate-ticker">
                    {/* First set of items */}
                    <TickerItem symbol="KIIRGS" price="81.190776641" change="2.25" />
                    <TickerItem symbol="AURORA" price="30.167864121" change="1.09" />
                    <TickerItem symbol="LUNCH" price="53.339676069" change="4.53" />
                    <TickerItem symbol="NEBUS" price="94.486769223" change="2.13" />
                    <TickerItem symbol="VORTEX" price="91.176005023" change="1.88" />

                    {/* Duplicate set for seamless loop */}
                    <TickerItem symbol="KIIRGS" price="81.190776641" change="2.25" />
                    <TickerItem symbol="AURORA" price="30.167864121" change="1.09" />
                    <TickerItem symbol="LUNCH" price="53.339676069" change="4.53" />
                    <TickerItem symbol="NEBUS" price="94.486769223" change="2.13" />
                    <TickerItem symbol="VORTEX" price="91.176005023" change="1.88" />
                </div>
            </div>
        </div>
    );
}
