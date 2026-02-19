
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
    "function getDealAmount(uint256 deal_id) view returns (uint256)",
    "function getMilestone(uint256 deal_id, uint256 index) view returns (uint256, bool, uint256, bool)",
    "event DealCreated(uint256 indexed deal_id, address client, address freelancer, uint256 amount, address token)"
];

const DealStatus = {
    0: "Created",
    1: "Funded",
    2: "Active",
    3: "Disputed",
    4: "Completed",
    5: "Cancelled"
};

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const client = new ethers.Wallet(CLIENT_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, client);

    console.log(`Contract: ${CONTRACT_ADDRESS}`);

    // Create a 3-milestone deal (30%, 50%, 20% of 0.0001 ETH)
    // 30% = 30000000000000 wei
    // 50% = 50000000000000 wei
    // 20% = 20000000000000 wei

    // BUT calculate exactly as frontend does (parseEther)
    const total = ethers.parseEther("0.0001");
    const m1 = (total * 30n) / 100n;
    const m2 = (total * 50n) / 100n;
    const m3 = (total * 20n) / 100n;

    // Check sum
    if (m1 + m2 + m3 !== total) {
        console.error("Math error in script setup!");
        return;
    }

    console.log("\n--- Creating 3-Milestone Deal ---");
    console.log(`Total: ${total}`);
    console.log(`M1: ${m1}`);
    console.log(`M2: ${m2}`);
    console.log(`M3: ${m3}`);

    const tx = await contract.createDeal(
        Date.now(),
        new ethers.Wallet(FREELANCER_KEY).address,
        new ethers.Wallet(ARBITER_KEY).address,
        ethers.ZeroAddress,
        total,
        [m1, m2, m3],
        [0, 0, 0],
        [true, true, true],
        { value: total }
    );
    const receipt = await tx.wait();
    const dealId = BigInt(receipt.logs[0].topics[1]);
    console.log(`Deal Created! ID: ${dealId}`);

    // Check status
    let status = await contract.getDealStatus(dealId);
    console.log(`Status Initial: ${DealStatus[Number(status)]}`);

    // Release M1
    console.log("\nReleasing Milestone 0 (30%)...");
    await (await contract.releaseMilestone(dealId, 0)).wait();

    status = await contract.getDealStatus(dealId);
    let remaining = await contract.getDealAmount(dealId);
    console.log(`Status: ${DealStatus[Number(status)]}, Remaining: ${remaining}`);

    // Release M2
    console.log("\nReleasing Milestone 1 (50%)...");
    await (await contract.releaseMilestone(dealId, 1)).wait();

    status = await contract.getDealStatus(dealId);
    remaining = await contract.getDealAmount(dealId);
    console.log(`Status: ${DealStatus[Number(status)]}, Remaining: ${remaining}`);

    if (Number(status) === 4) {
        console.error("❌ FAIL: Deal completed prematurely!");
    } else if (Number(status) === 2) {
        console.log("✅ PASS: Deal is still Active");
    }

    // Release M3
    console.log("\nReleasing Milestone 2 (20%)...");
    await (await contract.releaseMilestone(dealId, 2)).wait();

    status = await contract.getDealStatus(dealId);
    remaining = await contract.getDealAmount(dealId);
    console.log(`Status: ${DealStatus[Number(status)]}, Remaining: ${remaining}`);

    if (Number(status) === 4) {
        console.log("✅ PASS: Deal completed correctly after last milestone");
    } else {
        console.error("❌ FAIL: Deal did not complete!");
    }
}

main().catch(console.error);
