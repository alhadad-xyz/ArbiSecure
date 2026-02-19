import { createWalletClient, createPublicClient, http, parseEther, formatEther } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { ARBISECURE_ABI } from "../lib/abi";

// Use the newly deployed contract address
const CONTRACT_ADDRESS = "0x85e00908bbf09ae656aa553b027a490eb42a54cc" as `0x${string}`;

// Wallet private keys
const CLIENT_KEY = "0x9e3aacc6ec546a80e38c54cdd1d13fb9c5ac8de97af1db7879a6f78b1da267b0";
const FREELANCER_KEY = "0x3bbfb290aa9d92449e84c61aa494dadeaae7ec7baaf8bdc90f5316f59782ce16";

const ARBITER_ADDRESS = "0x53A4441309d747DC378d001fD92a2a949d84BB49"; // Default arbiter
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
    console.log("\n🧪 ===== TESTING COMPLETE DEAL FLOW =====\n");

    // Setup accounts
    const clientAccount = privateKeyToAccount(CLIENT_KEY as `0x${string}`);
    const freelancerAccount = privateKeyToAccount(FREELANCER_KEY as `0x${string}`);

    console.log("👥 Participants:");
    console.log(`   Client: ${clientAccount.address}`);
    console.log(`   Freelancer: ${freelancerAccount.address}`);
    console.log(`   Arbiter: ${ARBITER_ADDRESS}`);
    console.log(`   Contract: ${CONTRACT_ADDRESS}\n`);

    // Setup clients
    const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const clientWallet = createWalletClient({
        account: clientAccount,
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    // Check balances
    const clientBalance = await publicClient.getBalance({ address: clientAccount.address });
    const freelancerBalance = await publicClient.getBalance({ address: freelancerAccount.address });

    console.log("💰 Initial Balances:");
    console.log(`   Client: ${formatEther(clientBalance)} ETH`);
    console.log(`   Freelancer: ${formatEther(freelancerBalance)} ETH\n`);

    if (clientBalance < parseEther("0.001")) {
        console.error("❌ Client has insufficient balance for testing!");
        return;
    }

    // ===== STEP 1: CREATE DEAL =====
    console.log("📝 STEP 1: Creating Deal...");

    const dealAmount = parseEther("0.0001"); // 0.0001 ETH
    const milestoneAmounts = [dealAmount]; // Single milestone
    const milestoneEndTimes = [BigInt(0)]; // No time lock
    const milestoneApprovals = [true]; // Requires approval

    try {
        // Get gas parameters
        const block = await publicClient.getBlock();
        const baseFee = block.baseFeePerGas || 0n;
        const maxFeePerGas = (baseFee * 13n) / 10n;
        const maxPriorityFeePerGas = baseFee / 10n;

        const createHash = await clientWallet.writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: ARBISECURE_ABI,
            functionName: "create_deal",
            args: [
                BigInt(0), // ref_id
                freelancerAccount.address,
                ARBITER_ADDRESS as `0x${string}`,
                ZERO_ADDRESS as `0x${string}`, // ETH
                dealAmount,
                milestoneAmounts,
                milestoneEndTimes,
                milestoneApprovals
            ],
            value: dealAmount,
            maxFeePerGas,
            maxPriorityFeePerGas
        });

        console.log(`   ✅ Transaction sent: ${createHash}`);
        console.log(`   ⏳ Waiting for confirmation...`);

        const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createHash });

        if (createReceipt.status !== 'success') {
            console.error("   ❌ Transaction failed!");
            return;
        }

        console.log(`   ✅ Deal created! Block: ${createReceipt.blockNumber}`);

        // Extract deal ID from logs
        let dealId: bigint | null = null;
        for (const log of createReceipt.logs) {
            try {
                const decoded = publicClient.decodeEventLog({
                    abi: ARBISECURE_ABI,
                    data: log.data,
                    topics: log.topics
                }) as any;

                if (decoded.eventName === 'DealCreated') {
                    dealId = decoded.args.deal_id;
                    console.log(`   🎯 Deal ID: ${dealId}\n`);
                    break;
                }
            } catch (e) {
                // Not a DealCreated event
            }
        }

        if (dealId === null) {
            console.error("   ❌ Could not extract deal ID from logs!");
            return;
        }

        // ===== STEP 2: VERIFY DEAL ON-CHAIN =====
        console.log("🔍 STEP 2: Verifying Deal On-Chain...");

        const onChainClient = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: ARBISECURE_ABI,
            functionName: "getDealClient",
            args: [dealId]
        });

        const onChainFreelancer = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: ARBISECURE_ABI,
            functionName: "getDealFreelancer",
            args: [dealId]
        });

        const onChainStatus = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: ARBISECURE_ABI,
            functionName: "getDealStatus",
            args: [dealId]
        }) as number;

        const milestone = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: ARBISECURE_ABI,
            functionName: "getMilestone",
            args: [dealId, BigInt(0)]
        }) as any;

        console.log(`   ✅ Client: ${onChainClient}`);
        console.log(`   ✅ Freelancer: ${onChainFreelancer}`);
        console.log(`   ✅ Status: ${onChainStatus} (1=Funded)`);
        console.log(`   ✅ Milestone 0 Amount: ${formatEther(milestone[0])} ETH`);
        console.log(`   ✅ Milestone 0 Released: ${milestone[1]}\n`);

        // ===== STEP 3: RELEASE MILESTONE =====
        console.log("💸 STEP 3: Releasing Milestone...");

        const releaseHash = await clientWallet.writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: ARBISECURE_ABI,
            functionName: "releaseMilestone",
            args: [dealId, BigInt(0)],
            maxFeePerGas,
            maxPriorityFeePerGas
        });

        console.log(`   ✅ Transaction sent: ${releaseHash}`);
        console.log(`   ⏳ Waiting for confirmation...`);

        const releaseReceipt = await publicClient.waitForTransactionReceipt({ hash: releaseHash });

        if (releaseReceipt.status !== 'success') {
            console.error("   ❌ Release transaction failed!");
            return;
        }

        console.log(`   ✅ Milestone released! Block: ${releaseReceipt.blockNumber}\n`);

        // ===== STEP 4: VERIFY FINAL STATE =====
        console.log("✅ STEP 4: Verifying Final State...");

        const finalMilestone = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: ARBISECURE_ABI,
            functionName: "getMilestone",
            args: [dealId, BigInt(0)]
        }) as any;

        const finalFreelancerBalance = await publicClient.getBalance({ address: freelancerAccount.address });

        console.log(`   ✅ Milestone 0 Released: ${finalMilestone[1]}`);
        console.log(`   ✅ Freelancer Balance: ${formatEther(finalFreelancerBalance)} ETH`);
        console.log(`   ✅ Balance Increase: ${formatEther(finalFreelancerBalance - freelancerBalance)} ETH\n`);

        console.log("🎉 ===== TEST COMPLETED SUCCESSFULLY =====\n");

    } catch (e: any) {
        console.error("\n❌ Error:", e.shortMessage || e.message);
        console.error(e);
    }
}

main();
