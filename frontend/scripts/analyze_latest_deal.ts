import { createPublicClient, http, decodeEventLog } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { ARBISECURE_ABI } from "../lib/abi";

const CONTRACT_ADDRESS = "0x85e00908bbf09ae656aa553b027a490eb42a54cc" as `0x${string}`;

async function main() {
    const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    // Check the latest createDeal tx
    const txHash = "0x4ef911d33f8a54b91246f3cc31783528ece850a33e5114e0e580ad434fc0bfaf" as `0x${string}`;
    console.log(`\n🔍 Analyzing createDeal tx: ${txHash}\n`);

    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    console.log(`Status: ${receipt.status}`);
    console.log(`Logs: ${receipt.logs.length}\n`);

    let dealId: bigint | null = null;

    for (const log of receipt.logs) {
        console.log(`Log address: ${log.address}`);
        if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
            try {
                const decoded = decodeEventLog({
                    abi: ARBISECURE_ABI,
                    data: log.data,
                    topics: log.topics
                });
                console.log(`✅ Event: ${decoded.eventName}`);
                console.log(`   Args:`, decoded.args);
                if (decoded.eventName === 'DealCreated') {
                    dealId = (decoded.args as any).deal_id;
                }
            } catch (e: any) {
                console.log(`❌ Decode failed: ${e.message}`);
            }
        }
    }

    if (dealId === null) {
        console.log("\n❌ No DealCreated event found");
        return;
    }

    console.log(`\n📋 Deal ID: ${dealId}`);
    console.log(`\n🔍 Querying deal ${dealId}...`);

    try {
        const client = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: "getDealClient",
            args: [dealId]
        });
        console.log(`✅ Client: ${client}`);

        const status = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: "getDealStatus",
            args: [dealId]
        });
        console.log(`✅ Status: ${status}`);

        const amount = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: "getDealAmount",
            args: [dealId]
        });
        console.log(`✅ Amount: ${amount}`);

        const milestone = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: "getMilestone",
            args: [dealId, BigInt(0)]
        }) as any;
        console.log(`✅ Milestone 0: amount=${milestone[0]}, released=${milestone[1]}`);

    } catch (e: any) {
        console.error(`❌ Query failed: ${e.shortMessage || e.message}`);
    }
}

main();
