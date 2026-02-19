import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { ARBISECURE_ABI } from "../lib/abi";

async function main() {
    const client = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const contractAddress = "0x4c27770495f9d11c98b53020acbcabf2c44e714a" as `0x${string}`;

    console.log(`\n🔍 Checking contract state...\n`);

    try {
        // The deal_counter is not exposed as a public getter in the contract
        // But we can infer it by checking which deal IDs exist

        console.log("Testing deal IDs to find which exist:");

        for (let i = 0; i <= 5; i++) {
            try {
                const client_addr = await client.readContract({
                    address: contractAddress,
                    abi: ARBISECURE_ABI,
                    functionName: "get_deal_client",
                    args: [BigInt(i)]
                });
                console.log(`  ✅ Deal ${i} EXISTS - Client: ${client_addr}`);
            } catch (e) {
                console.log(`  ❌ Deal ${i} does not exist`);
            }
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
