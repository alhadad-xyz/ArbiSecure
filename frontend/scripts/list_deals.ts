import { createPublicClient, http, decodeEventLog, parseAbiItem } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { ARBISECURE_ABI, CONTRACT_ADDRESS } from "../lib/abi";
import { config } from "dotenv";

config({ path: "../.env", override: true });

async function main() {
    const client = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const contractAddress = "0x4c27770495f9d11c98b53020acbcabf2c44e714a";
    console.log(`Scanning for DealCreated events on ${contractAddress}...`);

    try {
        const logs = await client.getLogs({
            address: contractAddress as `0x${string}`,
            event: parseAbiItem('event DealCreated(uint256 indexed deal_id, uint256 ref_id, address client, address freelancer, uint256 amount)'),
            fromBlock: 0n
        });

        console.log(`Found ${logs.length} deal(s):`);

        for (const log of logs) {
            console.log(`- Deal ID: ${log.args.deal_id}, Ref ID: ${log.args.ref_id}, Client: ${log.args.client}`);
        }

    } catch (e) {
        console.error("Error fetching logs:", e);
    }
}

main();
