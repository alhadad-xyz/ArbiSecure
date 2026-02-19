import { createPublicClient, http, formatEther } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { ARBISECURE_ABI } from "../lib/abi";

async function main() {
    const client = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const contractAddress = "0x4c27770495f9d11c98b53020acbcabf2c44e714a" as `0x${string}`;
    const dealId = BigInt(4);

    console.log(`\n🔍 Verifying Deal ${dealId} on ${contractAddress}...\n`);

    try {
        const clientAddr = await client.readContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "get_deal_client",
            args: [dealId]
        });
        console.log(`✅ Client: ${clientAddr}`);

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

        const amount = await client.readContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "get_deal_amount",
            args: [dealId]
        });
        console.log(`✅ Amount: ${formatEther(amount as bigint)} ETH`);

        console.log(`\n✅ Deal ${dealId} EXISTS on-chain and is valid!`);

    } catch (e: any) {
        console.error(`\n❌ Deal ${dealId} does NOT exist on-chain`);
        console.error(`Error: ${e.shortMessage || e.message}`);
    }
}

main();
