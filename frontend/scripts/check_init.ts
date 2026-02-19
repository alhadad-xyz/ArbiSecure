import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { ARBISECURE_ABI } from "../lib/abi";

async function main() {
    const client = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const contractAddress = "0x4C27770495f9D11C98B53020acbcaBF2C44E714A" as `0x${string}`;

    console.log(`\n🔍 Checking contract admin and initialization...\n`);

    try {
        const admin = await client.readContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "admin",
            args: []
        });

        console.log(`Admin address: ${admin}`);

        if (admin === '0x0000000000000000000000000000000000000000') {
            console.log("\n❌ Contract NOT initialized! Admin is zero address.");
            console.log("   The contract needs to call initialize() first.");
        } else {
            console.log("\n✅ Contract is initialized");
        }

    } catch (e: any) {
        console.error("Error checking admin:", e.shortMessage || e.message);
    }
}

main();
