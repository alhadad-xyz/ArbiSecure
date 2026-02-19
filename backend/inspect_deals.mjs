
import { ethers } from "ethers";

// ─── Config ────────────────────────────────────────────────────────────────

const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const CONTRACT_ADDRESS = "0x2119a6c68af14bdf442a749f4a0a1c775927568a";

// ─── ABI ───────────────────────────────────────────────────────────────────

const ABI = [
    "function getDealStatus(uint256 deal_id) view returns (uint256)",
    "function getDealAmount(uint256 deal_id) view returns (uint256)",
    "function getMilestone(uint256 deal_id, uint256 index) view returns (uint256, bool, uint256, bool)",
    "function deal_counter() view returns (uint256)"
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
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    console.log(`Contract: ${CONTRACT_ADDRESS}`);

    // Inspect IDs 0 to 10
    console.log("Checking IDs 0 to 10...");
    for (let i = 0; i <= 10; i++) {
        const id = BigInt(i);
        console.log(`\n--- Deal ID: ${id} ---`);

        try {
            const status = await contract.getDealStatus(id);
            const remaining = await contract.getDealAmount(id);
            console.log(`Status: ${status} (${DealStatus[Number(status)]})`);
            console.log(`Remaining: ${ethers.formatEther(remaining)} ETH`);

            // Fetch milestones until error
            let mIndex = 0;
            while (true) {
                try {
                    const m = await contract.getMilestone(id, BigInt(mIndex));
                    console.log(`  Milestone ${mIndex}:`);
                    console.log(`    Amount: ${ethers.formatEther(m[0])} ETH`);
                    console.log(`    Released: ${m[1]}`);
                    console.log(`    End Time: ${m[2]}`);
                    console.log(`    Req Approval: ${m[3]}`);
                    mIndex++;
                } catch (e) {
                    break;
                }
            }
        } catch (e) {
            console.log(`  Error: ${e.message}`);
        }
    }
}

main().catch(console.error);
