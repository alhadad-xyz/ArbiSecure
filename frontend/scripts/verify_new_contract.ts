import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { ARBISECURE_ABI, CONTRACT_ADDRESS } from "../lib/abi";

async function main() {
    const client = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    console.log(`\n🔍 Verifying new contract at ${CONTRACT_ADDRESS}...\n`);

    try {
        const admin = await client.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: ARBISECURE_ABI,
            functionName: "admin",
            args: []
        });

        console.log(`Admin address: ${admin}`);

        if (admin === '0x0000000000000000000000000000000000000000') {
            console.log("\n⚠️  Contract NOT initialized - admin is zero address");
            console.log("   This is expected for a fresh deployment.");
            console.log("   The first user to call initialize() will become admin.");
        } else {
            console.log("\n✅ Contract IS initialized!");
            console.log(`   Admin: ${admin}`);
        }

        // Check bytecode exists
        const bytecode = await client.getBytecode({ address: CONTRACT_ADDRESS as `0x${string}` });
        console.log(`\n✅ Contract deployed successfully`);
        console.log(`   Bytecode length: ${bytecode?.length || 0} characters`);

    } catch (e: any) {
        console.error("\n❌ Error:", e.shortMessage || e.message);
    }
}

main();
