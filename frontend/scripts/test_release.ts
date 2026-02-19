import { createWalletClient, createPublicClient, http, formatEther } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { ARBISECURE_ABI } from "../lib/abi";

const CONTRACT_ADDRESS = "0x85e00908bbf09ae656aa553b027a490eb42a54cc" as `0x${string}`;
const CLIENT_KEY = "0x9e3aacc6ec546a80e38c54cdd1d13fb9c5ac8de97af1db7879a6f78b1da267b0";
const FREELANCER_KEY = "0x3bbfb290aa9d92449e84c61aa494dadeaae7ec7baaf8bdc90f5316f59782ce16";

async function main() {
    console.log("\n💸 ===== TESTING MILESTONE RELEASE =====\n");

    const clientAccount = privateKeyToAccount(CLIENT_KEY as `0x${string}`);
    const freelancerAccount = privateKeyToAccount(FREELANCER_KEY as `0x${string}`);

    const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const clientWallet = createWalletClient({
        account: clientAccount,
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const dealId = BigInt(0);

    console.log(`📋 Deal ID: ${dealId}`);
    console.log(`👤 Client: ${clientAccount.address}`);
    console.log(`👤 Freelancer: ${freelancerAccount.address}\n`);

    // Check initial state
    console.log("🔍 Checking initial state...");

    const initialMilestone = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "getMilestone",
        args: [dealId, BigInt(0)]
    }) as any;

    const initialBalance = await publicClient.getBalance({ address: freelancerAccount.address });

    console.log(`   Milestone 0 Amount: ${formatEther(initialMilestone[0])} ETH`);
    console.log(`   Milestone 0 Released: ${initialMilestone[1]}`);
    console.log(`   Freelancer Balance: ${formatEther(initialBalance)} ETH\n`);

    if (initialMilestone[1]) {
        console.log("⚠️  Milestone already released!");
        return;
    }

    // Release milestone
    console.log("💸 Releasing milestone...");

    const block = await publicClient.getBlock();
    const baseFee = block.baseFeePerGas || 0n;
    const maxFeePerGas = (baseFee * 13n) / 10n;
    const maxPriorityFeePerGas = baseFee / 10n;

    const releaseHash = await clientWallet.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "releaseMilestone",
        args: [dealId, BigInt(0)],
        maxFeePerGas,
        maxPriorityFeePerGas
    });

    console.log(`   ✅ Transaction sent: ${releaseHash}`);
    console.log(`   ⏳ Waiting for confirmation...`);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: releaseHash });

    if (receipt.status !== 'success') {
        console.error("   ❌ Transaction failed!");
        return;
    }

    console.log(`   ✅ Milestone released! Block: ${receipt.blockNumber}\n`);

    // Check final state
    console.log("✅ Checking final state...");

    const finalMilestone = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "getMilestone",
        args: [dealId, BigInt(0)]
    }) as any;

    const finalBalance = await publicClient.getBalance({ address: freelancerAccount.address });

    console.log(`   Milestone 0 Released: ${finalMilestone[1]}`);
    console.log(`   Freelancer Balance: ${formatEther(finalBalance)} ETH`);
    console.log(`   Balance Increase: ${formatEther(finalBalance - initialBalance)} ETH\n`);

    console.log("🎉 ===== TEST COMPLETED SUCCESSFULLY =====\n");
}

main();
