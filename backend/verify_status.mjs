
import { ethers } from "ethers";
import fs from "fs";

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

    // TEST 1: Single Milestone (Should go to Completed)
    console.log("\n--- TEST 1: Single Milestone Deal ---");
    const amount1 = ethers.parseEther("0.0001");
    try {
        const tx1 = await contract.createDeal(
            Date.now(),
            new ethers.Wallet(FREELANCER_KEY).address,
            new ethers.Wallet(ARBITER_KEY).address,
            ethers.ZeroAddress,
            amount1,
            [amount1], // 1 milestone
            [0], // No time lock
            [true], // Manual approval
            { value: amount1 }
        );
        const receipt1 = await tx1.wait();
        const deal1Id = BigInt(receipt1.logs[0].topics[1]);
        console.log(`Deal 1 Created! ID: ${deal1Id}`);

        let status = await contract.getDealStatus(deal1Id);
        console.log(`Status Initial: ${status} (${DealStatus[Number(status)]})`);

        console.log("Releasing Milestone 0...");
        const txRel1 = await contract.releaseMilestone(deal1Id, 0);
        await txRel1.wait();

        status = await contract.getDealStatus(deal1Id);
        console.log(`Status After Release: ${status} (${DealStatus[Number(status)]})`);

        if (Number(status) === 4) console.log("✅ PASS: Deal 1 is COMPLETED");
        else console.error("❌ FAIL: Deal 1 should be COMPLETED");

    } catch (e) {
        console.error("Test 1 Failed:", e);
    }

    // TEST 2: Multi Milestone (Should be Active)
    console.log("\n--- TEST 2: Multi Milestone Deal ---");
    const amount2 = ethers.parseEther("0.0002");
    const half = ethers.parseEther("0.0001");
    try {
        const tx2 = await contract.createDeal(
            Date.now(),
            new ethers.Wallet(FREELANCER_KEY).address,
            new ethers.Wallet(ARBITER_KEY).address,
            ethers.ZeroAddress,
            amount2,
            [half, half], // 2 milestones
            [0, 0],
            [true, true],
            { value: amount2 }
        );
        const receipt2 = await tx2.wait();
        const deal2Id = BigInt(receipt2.logs[0].topics[1]);
        console.log(`Deal 2 Created! ID: ${deal2Id}`);

        let status = await contract.getDealStatus(deal2Id);
        console.log(`Status Initial: ${status} (${DealStatus[Number(status)]})`);

        console.log("Releasing Milestone 0...");
        const txRel2 = await contract.releaseMilestone(deal2Id, 0);
        await txRel2.wait();

        status = await contract.getDealStatus(deal2Id);
        console.log(`Status After Partial Release: ${status} (${DealStatus[Number(status)]})`);

        if (Number(status) === 2) console.log("✅ PASS: Deal 2 is ACTIVE");
        else console.error("❌ FAIL: Deal 2 should be ACTIVE");

    } catch (e) {
        console.error("Test 2 Failed:", e);
    }
}

main().catch(console.error);
