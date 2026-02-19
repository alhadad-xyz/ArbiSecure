
import { ethers } from "ethers";

// ─── Config ────────────────────────────────────────────────────────────────

const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const CONTRACT_ADDRESS = "0x2119a6c68af14bdf442a749f4a0a1c775927568a";

// Keys
const CLIENT_KEY = "0x9e3aacc6ec546a80e38c54cdd1d13fb9c5ac8de97af1db7879a6f78b1da267b0";
const FREELANCER_KEY = "0x3bbfb290aa9d92449e84c61aa494dadeaae7ec7baaf8bdc90f5316f59782ce16";
const ARBITER_KEY = "0x943cac2a76741683f0271702787d4a9e3a4fc2795489711d480cd3844ad2420f";

// ─── ABI ───────────────────────────────────────────────────────────────────

const ABI = [
    "function createDeal(uint256 _ref_id, address freelancer, address arbiter, address token, uint256 amount, uint256[] milestone_amounts, uint256[] milestone_end_times, bool[] milestone_approvals) payable returns (uint256)",
    "function releaseMilestone(uint256 deal_id, uint256 milestone_index)",
    "function getDealStatus(uint256 deal_id) view returns (uint256)",
    "event DealCreated(uint256 indexed deal_id, address client, address freelancer, uint256 amount, address token)"
];

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const client = new ethers.Wallet(CLIENT_KEY, provider);
    const freelancer = new ethers.Wallet(FREELANCER_KEY, provider);

    // Contracts
    const contractAsClient = new ethers.Contract(CONTRACT_ADDRESS, ABI, client);
    const contractAsFreelancer = new ethers.Contract(CONTRACT_ADDRESS, ABI, freelancer);

    console.log(`Contract: ${CONTRACT_ADDRESS}`);

    // Create a time-locked deal
    // 1 hour delay (end_time = now + 3600)
    // milestone_approvals = [false] (No manual approval required, usually means auto-release)
    // But we want to test "Early Manual Approval override".

    console.log("\n--- Creating Time-Locked Deal ---");
    const amount = ethers.parseEther("0.0001");
    const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    const tx = await contractAsClient.createDeal(
        Date.now(),
        freelancer.address,
        new ethers.Wallet(ARBITER_KEY).address,
        ethers.ZeroAddress,
        amount,
        [amount],
        [futureTime],
        [false], // requires_approval = false (Auto-release)
        { value: amount }
    );
    const receipt = await tx.wait();
    const dealId = BigInt(receipt.logs[0].topics[1]);
    console.log(`Deal Created! ID: ${dealId}`);
    console.log(`Milestone 0: Time-locked until ${new Date(futureTime * 1000).toISOString()}`);

    // TEST 1: Freelancer tries to release early -> Should Fail "Time"
    console.log("\n--- TEST 1: Freelancer Early Release (Should Fail) ---");
    try {
        await contractAsFreelancer.releaseMilestone(dealId, 0);
        console.error("❌ FAIL: Freelancer was able to release early!");
    } catch (e) {
        if (e.message.includes("Time") || e.message.includes("revert")) {
            console.log("✅ PASS: Freelancer blocked by time lock");
        } else {
            console.error("❌ FAIL: Unexpected error:", e);
        }
    }

    // TEST 2: Client tries to release early -> Should Succeed (Manual Override)
    console.log("\n--- TEST 2: Client Early Release (Should Succeed) ---");
    try {
        const txRel = await contractAsClient.releaseMilestone(dealId, 0);
        await txRel.wait();
        console.log("✅ PASS: Client successfully released early!");

        const status = await contractAsClient.getDealStatus(dealId);
        // Should be Completed (4)
        if (Number(status) === 4) console.log("✅ Status updated to Completed");
        else console.warn(`⚠️ Status is ${status} (Expected 4)`);

    } catch (e) {
        console.error("❌ FAIL: Client failed to release early:", e);
    }
}

main().catch(console.error);
