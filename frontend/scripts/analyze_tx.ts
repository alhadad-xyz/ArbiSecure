import { createPublicClient, http, decodeEventLog } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { ARBISECURE_ABI } from "../lib/abi";

async function main() {
    const client = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    // Transaction hash from the screenshot
    const txHash = "0xf3aca13acfca0f66751514fbf3caf9e0f19f87f6eef5abfe44c16a89937dad79" as `0x${string}`;

    console.log(`\n🔍 Analyzing transaction: ${txHash}\n`);

    try {
        const receipt = await client.getTransactionReceipt({ hash: txHash });

        console.log(`Status: ${receipt.status === 'success' ? '✅ Success' : '❌ Failed'}`);
        console.log(`Block: ${receipt.blockNumber}`);
        console.log(`Gas Used: ${receipt.gasUsed}`);
        console.log(`\nLogs (${receipt.logs.length} total):`);

        for (const log of receipt.logs) {
            try {
                const decoded = decodeEventLog({
                    abi: ARBISECURE_ABI,
                    data: log.data,
                    topics: log.topics
                });

                if (decoded.eventName === 'DealCreated') {
                    console.log(`\n✅ Found DealCreated event!`);
                    console.log(`   Deal ID: ${decoded.args.deal_id}`);
                    console.log(`   Client: ${decoded.args.client}`);
                    console.log(`   Freelancer: ${decoded.args.freelancer}`);
                    console.log(`   Amount: ${decoded.args.amount}`);
                }
            } catch (e) {
                // Not a DealCreated event or decoding failed
            }
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
