import { createPublicClient, createWalletClient, http, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { ARBISECURE_ABI, CONTRACT_ADDRESS } from "../lib/abi";
import { config } from "dotenv";

config({ path: "../.env", override: true });

async function main() {
    const rpcUrl = process.env.RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";

    let privateKey = process.env.PRIVATE_KEY?.trim() || "";
    if (!privateKey.startsWith("0x")) {
        privateKey = `0x${privateKey}`;
    }

    if (privateKey.length !== 66) { // 0x + 64 chars
        throw new Error("Invalid Private Key length");
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const client = createPublicClient({
        chain: arbitrumSepolia,
        transport: http(rpcUrl)
    });

    const wallet = createWalletClient({
        account,
        chain: arbitrumSepolia,
        transport: http(rpcUrl)
    });

    const contractAddress = "0x4c27770495f9d11c98b53020acbcabf2c44e714a"; // CONTRACT_ADDRESS;
    const arbiterAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Mock arbiter
    const freelancerAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Mock freelancer

    // Scenarios to test:
    // 1. Create Deal with 2 Milestones (1 Auto-release, 1 Manual Approval)
    // 2. Freelancer tries to release Auto-release milestone (Should Succeed)
    // 3. Freelancer tries to release Manual Approval milestone (Should Fail)
    // 4. Client tries to release Manual Approval milestone (Should Succeed)

    console.log("🚀 Starting Milestone Tests...");
    console.log(`Contract: ${contractAddress}`);
    console.log(`Tester: ${account.address}`);

    const totalAmount = parseEther("0.02"); // Small amount
    const milestoneAmounts = [parseEther("0.01"), parseEther("0.01")];
    const milestoneEndTimes = [BigInt(0), BigInt(0)];
    const milestoneApprovals = [false, true]; // [Auto, Manual]

    console.log("\n1️⃣ Creating Deal...");
    const hash = await wallet.writeContract({
        address: contractAddress,
        abi: ARBISECURE_ABI,
        functionName: "createDeal",
        args: [
            BigInt(Date.now()), // ref_id
            freelancerAddress,
            arbiterAddress,
            "0x0000000000000000000000000000000000000000",
            totalAmount,
            milestoneAmounts,
            milestoneEndTimes,
            milestoneApprovals
        ],
        value: totalAmount
    });

    console.log(`Transaction sent: ${hash}`);
    const receipt = await client.waitForTransactionReceipt({ hash });

    // Parse Deal ID
    let dealId;
    for (const log of receipt.logs) {
        try {
            // Manual decoding or use a helper if available, but for script we can try/catch
            // event DealCreated(uint256 indexed deal_id, ...)
            // topic[0] is signature, topic[1] is deal_id
            if (log.topics[1]) {
                dealId = BigInt(log.topics[1]);
                console.log(`✅ Deal Created! ID: ${dealId}`);
                break;
            }
        } catch (e) { }
    }

    if (dealId === undefined) {
        console.error("❌ Failed to parse Deal ID");
        return;
    }

    // --- Scenario 2: Release Auto-Release Milestone (Any caller, usually) ---
    console.log("\n2️⃣ Releasing Auto-Release Milestone (Index 0)...");
    try {
        const r1Hash = await wallet.writeContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "release_milestone",
            args: [dealId, BigInt(0)]
        });
        console.log(`Tx sent: ${r1Hash}`);
        await client.waitForTransactionReceipt({ hash: r1Hash });
        console.log("✅ Auto-release successful!");
    } catch (e) {
        console.error("❌ Auto-release failed:", e);
    }

    // --- Scenario 3: Release Manual Approval Milestone (As Client - checking if it works) ---
    // Note: Since we are deploying with our content, we ARE the client.
    // To test "Freelancer failing", we'd need another wallet. 
    // For now, let's verify WE (Client) can release the manual one.

    console.log("\n3️⃣ Releasing Manual Approval Milestone (Index 1)...");
    try {
        const r2Hash = await wallet.writeContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "release_milestone",
            args: [dealId, BigInt(1)]
        });
        console.log(`Tx sent: ${r2Hash}`);
        await client.waitForTransactionReceipt({ hash: r2Hash });
        console.log("✅ Manual release successful!");
    } catch (e) {
        console.error("❌ Manual release failed:", e);
    }

    console.log("\n✅ Test Complete!");
}

main().catch(console.error);
