import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { ARBISECURE_ABI } from "../lib/abi";

const CONTRACT_ADDRESS = "0x85e00908bbf09ae656aa553b027a490eb42a54cc" as `0x${string}`;

async function main() {
    const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    console.log(`\n🔍 Checking Deal ID 0 on ${CONTRACT_ADDRESS}...\n`);

    try {
        const client = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: "getDealClient",
            args: [BigInt(0)]
        });
        console.log(`✅ Client: ${client}`);

        const freelancer = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: "getDealFreelancer",
            args: [BigInt(0)]
        });
        console.log(`✅ Freelancer: ${freelancer}`);

        const status = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: "getDealStatus",
            args: [BigInt(0)]
        });
        console.log(`✅ Status: ${status}`);

        const amount = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: "getDealAmount",
            args: [BigInt(0)]
        });
        console.log(`✅ Amount: ${amount}`);

        console.log(`\n✅ Deal 0 EXISTS!\n`);

    } catch (e: any) {
        console.error(`\n❌ Deal 0 does NOT exist`);
        console.error(`Error: ${e.shortMessage || e.message}\n`);
    }
}

main();
