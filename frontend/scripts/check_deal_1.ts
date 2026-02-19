import { createPublicClient, http, formatEther } from "viem";
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
    // Check Deal 0 first (created by test script)
    try {
        console.log(`Checking Deal 0...`);
        const status0 = await client.readContract({
            address: contractAddress as `0x${string}`,
            abi: ARBISECURE_ABI,
            functionName: "get_deal_status",
            args: [BigInt(0)]
        });
        console.log(`Deal 0 Status: ${status0}`);
    } catch (e) {
        console.log("Deal 0 error:", e);
    }

    const dealId = BigInt(1);

    console.log(`Checking Deal ${dealId} on ${contractAddress}...`);

    try {
        const dealClient = await client.readContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "get_deal_client",
            args: [dealId]
        });
        console.log(`Client: ${dealClient}`);

        const freelancer = await client.readContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "get_deal_freelancer",
            args: [dealId]
        });
        console.log(`Freelancer: ${freelancer}`);

        const status = await client.readContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "get_deal_status",
            args: [dealId]
        });
        console.log(`Status: ${status} (0=Pending, 1=Funded, 2=Released, ...)`);

        // Check Milestone 0
        const milestone = await client.readContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "get_milestone",
            args: [dealId, BigInt(0)]
        });
        console.log("\nMilestone 0:");
        console.log(`- Amount: ${formatEther(milestone[0])} ETH`);
        console.log(`- Is Released: ${milestone[1]}`);
        console.log(`- End Time: ${milestone[2]}`);
        console.log(`- Requires Approval: ${milestone[3]}`);

    } catch (e) {
        console.error("Error fetching deal:", e);
    }
}

main();
