
const { createPublicClient, http, parseAbi } = require('viem');
const { arbitrumSepolia } = require('viem/chains');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../frontend/.env.local') });

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "0x2119a6c68af14bdf442a749f4a0a1c775927568a";
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc"; // Hardcoded for reliability

const abi = parseAbi([
    'function getDealStatus(uint256 deal_id) view returns (uint256)',
    'function getDeal(uint256 deal_id) view returns ((address client, address freelancer, address arbiter, address token, uint256 amount, uint256 remaining_amount, uint256 start_time_seconds, uint256 ref_id, uint8 status, bool is_resolved, uint8 ruling))'
]);

const client = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(RPC_URL)
});

async function checkContract() {
    const dealId = BigInt(4);
    console.log(`Checking contract status for Deal ID: ${dealId}`);
    console.log(`Contract Address: ${CONTRACT_ADDRESS}`);

    try {
        const status = await client.readContract({
            address: CONTRACT_ADDRESS,
            abi,
            functionName: 'getDealStatus',
            args: [dealId]
        });
        console.log("Contract Status (Raw):", status);
        const statusMap = ["Pending", "Funded", "Active", "Disputed", "Completed"];
        console.log("Contract Status (Mapped):", statusMap[Number(status)]);

    } catch (e) {
        console.error("Error reading contract:", e);
    }
}

checkContract();
