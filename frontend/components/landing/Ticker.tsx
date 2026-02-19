"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const TickerItem = ({ symbol, price, change }: { symbol: string, price: number, change: number }) => {
    const isPositive = change > 0;
    return (
        <span className="inline-block px-4">
            <span className="text-xs font-mono text-white/50">
                <span className="text-white/50 bg-white/10 px-2 py-1 rounded mr-2">{symbol}</span>
                ${price.toLocaleString()}
                <span className={`ml-2 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                </span>
            </span>
        </span>
    );
};

export default function Ticker() {
    const [tickerData, setTickerData] = useState<any[]>([]);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                // Fetching top tokens on Arbitrum + major cryptos
                const response = await fetch(
                    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,arbitrum,chainlink,uniswap,aave&vs_currencies=usd&include_24hr_change=true"
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (!data.bitcoin || !data.ethereum) {
                    throw new Error("Invalid data structure");
                }

                const formattedData = [
                    { symbol: "BTC", price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
                    { symbol: "ETH", price: data.ethereum.usd, change: data.ethereum.usd_24h_change },
                    { symbol: "ARB", price: data.arbitrum.usd, change: data.arbitrum.usd_24h_change },
                    { symbol: "LINK", price: data.chainlink.usd, change: data.chainlink.usd_24h_change },
                    { symbol: "UNI", price: data.uniswap.usd, change: data.uniswap.usd_24h_change },
                    { symbol: "AAVE", price: data.aave.usd, change: data.aave.usd_24h_change },
                ];
                setTickerData(formattedData);
            } catch (error) {
                // Silently fail to fallback data to avoid console spam
                // console.warn("Using fallback ticker data:", error);

                // Fallback data if API fails (rate limits etc)
                setTickerData([
                    { symbol: "BTC", price: 64230.50, change: 2.4 },
                    { symbol: "ETH", price: 3450.12, change: 1.2 },
                    { symbol: "ARB", price: 1.23, change: -0.5 },
                    { symbol: "LINK", price: 18.45, change: 5.1 },
                    { symbol: "UNI", price: 7.50, change: -1.2 },
                    { symbol: "AAVE", price: 92.30, change: 3.4 },
                ]);
            }
        };

        fetchPrices();
        // Refresh every 60 seconds
        const interval = setInterval(fetchPrices, 60000);
        return () => clearInterval(interval);
    }, []);

    const displayData = tickerData.length > 0 ? tickerData : [
        { symbol: "BTC", price: 0, change: 0 },
        { symbol: "ETH", price: 0, change: 0 },
        { symbol: "ARB", price: 0, change: 0 }
    ];

    return (
        <div className="w-full border-y border-white/5 bg-white/5 backdrop-blur-sm py-2 overflow-hidden mb-12">
            <div className="w-full overflow-hidden whitespace-nowrap">
                <div className="inline-block animate-ticker">
                    {/* First set of items */}
                    {displayData.map((item, i) => (
                        <TickerItem key={i} symbol={item.symbol} price={item.price} change={item.change} />
                    ))}

                    {/* Duplicate set for seamless loop */}
                    {displayData.map((item, i) => (
                        <TickerItem key={`dup-${i}`} symbol={item.symbol} price={item.price} change={item.change} />
                    ))}
                </div>
            </div>
        </div>
    );

}
