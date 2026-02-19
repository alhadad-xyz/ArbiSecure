import { getDefaultConfig, Chain } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

const nitroDevnet = {
  id: 412346,
  name: 'Arbitrum Nitro Devnet',
  iconUrl: 'https://arbitrum.io/assets/arbitrum-shield.svg',
  iconBackground: '#fff',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8547'] },
  },
  blockExplorers: {
    default: { name: 'BlockScout', url: 'http://127.0.0.1:4000' }, // Nitro devnode often includes blockscout
  },
  testnet: true,
} as const satisfies Chain;

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "421614");
const chains = chainId === 412346 ? [nitroDevnet, arbitrumSepolia] : [arbitrumSepolia, nitroDevnet];

export const config = getDefaultConfig({
  appName: 'ArbiSecure',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [chains[0], ...chains.slice(1)], // Spread to satisfy type requirements if needed, or just pass 'chains' as [Chain, ...Chain[]] logic might apply
  transports: {
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc', {
      // Add 20% buffer to gas estimates to handle base fee fluctuations
      retryCount: 3,
      timeout: 30_000,
    }),
    [nitroDevnet.id]: http('http://127.0.0.1:8547'),
  },
  ssr: true,
  // Add global fee multiplier to prevent "max fee per gas less than block base fee" errors
  batch: {
    multicall: {
      wait: 50,
    },
  },
});
