import { createPublicClient, http, decodeEventLog } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { ARBISECURE_ABI } from "../lib/abi";

const CONTRACT_ADDRESS = "0x0455dd48ff7377aa2423b1d0d2fba7d2e51c56cf" as `0x${string}`;

async function main() {
    const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const txHash = "0x64b1f6c3d86ebe488e5bfd1f3d72acb59172cc4455ba8f8538178215bc4d8a97" as `0x${string}`;

    console.log(`\n🔍 Analyzing transaction: ${txHash}\n`);

    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

    console.log(`Status: ${receipt.status}`);
    console.log(`Block: ${receipt.blockNumber}`);
    console.log(`Logs: ${receipt.logs.length}\n`);

    for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        console.log(`Log ${i}:`);
        console.log(`  Address: ${log.address}`);
        console.log(`  Topics: ${log.topics.length}`);

        if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
            try {
                const decoded = decodeEventLog({
                    abi: ARBISECURE_ABI,
                    data: log.data,
                    topics: log.topics
                });

                console.log(`  ✅ Decoded Event: ${decoded.eventName}`);
                console.log(`  Args:`, decoded.args);
            } catch (e: any) {
                console.log(`  ❌ Could not decode: ${e.message}`);
            }
        }
        console.log();
    }
}

main();
