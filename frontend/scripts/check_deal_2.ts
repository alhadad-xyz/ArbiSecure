import { createPublicClient, http, formatEther } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { ARBISECURE_ABI } from "../lib/abi";
import { config } from "dotenv";

config({ path: "../.env", override: true });

async function main() {
    const client = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const contractAddress = "0x4c27770495f9d11c98b53020acbcabf2c44e714a" as `0x${string}`;
    const dealId = BigInt(2);

    console.log(`\n🔍 Checking Deal ${dealId} on ${contractAddress}...\n`);

    try {
        const client_addr = await client.readContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "get_deal_client",
            args: [dealId]
        });
        console.log(`✅ Client: ${client_addr}`);

        const freelancer = await client.readContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "get_deal_freelancer",
            args: [dealId]
        });
        console.log(`✅ Freelancer: ${freelancer}`);

        const status = await client.readContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "get_deal_status",
            args: [dealId]
        });
        console.log(`✅ Status: ${status} (0=Pending, 1=Funded, 2=Active, 3=Disputed, 4=Resolved)`);

        // Check Milestone 0
        const milestone = await client.readContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "get_milestone",
            args: [dealId, BigInt(0)]
        }) as [bigint, boolean, bigint, boolean];

        console.log("\n📝 Milestone 0:");
        console.log(`   Amount: ${formatEther(milestone[0])} ETH`);
        console.log(`   Is Released: ${milestone[1]}`);
        console.log(`   End Time: ${milestone[2]}`);
        console.log(`   Requires Approval: ${milestone[3]}`);

        console.log("\n💡 To release this milestone:");
        if (milestone[3]) {
            console.log(`   ✓ You MUST be connected as Client: ${client_addr}`);
        } else {
            console.log(`   ✓ Any address can release (auto-release)`);
        }
        if (milestone[1]) {
            console.log(`   ❌ Already released!`);
        } else {
            console.log(`   ✓ Not yet released`);
        }

    } catch (e: any) {
        console.error("❌ Error fetching deal:", e.shortMessage || e.message);
    }
}

main();
