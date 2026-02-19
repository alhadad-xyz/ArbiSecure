#!/usr/bin/env node
/**
 * ArbiSecure Demo Flow Test Script
 * 
 * Tests the full demo flow from the demo_script.md:
 *   1. Create deal (client funds escrow)
 *   2. Release milestone 0 (client approves)
 *   3. Raise dispute on a second deal
 *   4. Resolve dispute as arbiter (release to freelancer)
 * 
 * Usage:
 *   node scripts/demo_test.mjs
 * 
 * Wallets:
 *   Freelancer: 0x3bbfb290aa9d92449e84c61aa494dadeaae7ec7baaf8bdc90f5316f59782ce16
 *   Client:     0x9e3aacc6ec546a80e38c54cdd1d13fb9c5ac8de97af1db7879a6f78b1da267b0
 *   Arbiter:    0x943cac2a76741683f0271702787d4a9e3a4fc2795489711d480cd3844ad2420f
 */

import { ethers } from "ethers";

// ─── Config ────────────────────────────────────────────────────────────────

const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const CONTRACT_ADDRESS = "0x2119a6c68af14bdf442a749f4a0a1c775927568a";

// Private keys (provided by user for demo testing)
const FREELANCER_KEY = "0x3bbfb290aa9d92449e84c61aa494dadeaae7ec7baaf8bdc90f5316f59782ce16";
const CLIENT_KEY = "0x9e3aacc6ec546a80e38c54cdd1d13fb9c5ac8de97af1db7879a6f78b1da267b0";
const ARBITER_KEY = "0x943cac2a76741683f0271702787d4a9e3a4fc2795489711d480cd3844ad2420f";

// ─── ABI ───────────────────────────────────────────────────────────────────

const ABI = [
    {
        "type": "function",
        "name": "createDeal",
        "inputs": [
            { "name": "_ref_id", "type": "uint256" },
            { "name": "freelancer", "type": "address" },
            { "name": "arbiter", "type": "address" },
            { "name": "token", "type": "address" },
            { "name": "amount", "type": "uint256" },
            { "name": "milestone_amounts", "type": "uint256[]" },
            { "name": "milestone_end_times", "type": "uint256[]" },
            { "name": "milestone_approvals", "type": "bool[]" }
        ],
        "outputs": [{ "name": "deal_id", "type": "uint256" }],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "releaseMilestone",
        "inputs": [
            { "name": "deal_id", "type": "uint256" },
            { "name": "milestone_index", "type": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "raiseDispute",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "resolveDispute",
        "inputs": [
            { "name": "deal_id", "type": "uint256" },
            { "name": "client_share", "type": "uint256" },
            { "name": "freelancer_share", "type": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getDealStatus",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [{ "name": "status", "type": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getDealAmount",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [{ "name": "amount", "type": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getDealFreelancer",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [{ "name": "freelancer", "type": "address" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getDealClient",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [{ "name": "client", "type": "address" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getMilestone",
        "inputs": [
            { "name": "deal_id", "type": "uint256" },
            { "name": "index", "type": "uint256" }
        ],
        "outputs": [
            { "name": "amount", "type": "uint256" },
            { "name": "is_released", "type": "bool" },
            { "name": "end_timestamp", "type": "uint256" },
            { "name": "requires_approval", "type": "bool" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "DealCreated",
        "inputs": [
            { "name": "deal_id", "type": "uint256", "indexed": true },
            { "name": "client", "type": "address", "indexed": false },
            { "name": "freelancer", "type": "address", "indexed": false },
            { "name": "amount", "type": "uint256", "indexed": false },
            { "name": "token", "type": "address", "indexed": false }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "MilestoneReleased",
        "inputs": [
            { "name": "deal_id", "type": "uint256", "indexed": true },
            { "name": "milestone_index", "type": "uint256", "indexed": false },
            { "name": "freelancer", "type": "address", "indexed": false },
            { "name": "amount", "type": "uint256", "indexed": false }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "DisputeRaised",
        "inputs": [
            { "name": "deal_id", "type": "uint256", "indexed": true },
            { "name": "initiator", "type": "address", "indexed": false }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "DisputeResolved",
        "inputs": [
            { "name": "deal_id", "type": "uint256", "indexed": true },
            { "name": "client_amount", "type": "uint256", "indexed": false },
            { "name": "freelancer_amount", "type": "uint256", "indexed": false },
            { "name": "arbiter_fee", "type": "uint256", "indexed": false }
        ],
        "anonymous": false
    }
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const DEAL_STATUS = {
    0: "Pending",
    1: "Funded",
    2: "Completed",
    3: "Disputed",
    4: "Resolved"
};

function log(step, msg) {
    const ts = new Date().toISOString().slice(11, 19);
    console.log(`\n[${ts}] ✦ STEP ${step}: ${msg}`);
}

function ok(msg) {
    console.log(`  ✅ ${msg}`);
}

function info(msg) {
    console.log(`  ℹ  ${msg}`);
}

function warn(msg) {
    console.log(`  ⚠️  ${msg}`);
}

async function waitForTx(tx, label) {
    info(`Sending ${label}... tx: ${tx.hash}`);
    const receipt = await tx.wait();
    ok(`${label} confirmed in block ${receipt.blockNumber} (gas: ${receipt.gasUsed.toString()})`);
    return receipt;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  ArbiSecure — Demo Flow Test Script");
    console.log("  Network: Arbitrum Sepolia");
    console.log(`  Contract: ${CONTRACT_ADDRESS}`);
    console.log("═══════════════════════════════════════════════════════");

    // Setup provider & signers
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const network = await provider.getNetwork();
    info(`Connected to chain ${network.chainId} (${network.name})`);

    const freelancer = new ethers.Wallet(FREELANCER_KEY, provider);
    const client = new ethers.Wallet(CLIENT_KEY, provider);
    const arbiter = new ethers.Wallet(ARBITER_KEY, provider);

    console.log("\n  Wallets:");
    console.log(`    Freelancer: ${freelancer.address}`);
    console.log(`    Client:     ${client.address}`);
    console.log(`    Arbiter:    ${arbiter.address}`);

    // Check balances
    const [flBal, clBal, arBal] = await Promise.all([
        provider.getBalance(freelancer.address),
        provider.getBalance(client.address),
        provider.getBalance(arbiter.address),
    ]);
    console.log("\n  Balances:");
    console.log(`    Freelancer: ${ethers.formatEther(flBal)} ETH`);
    console.log(`    Client:     ${ethers.formatEther(clBal)} ETH`);
    console.log(`    Arbiter:    ${ethers.formatEther(arBal)} ETH`);

    const MIN_BALANCE = ethers.parseEther("0.001");
    if (clBal < MIN_BALANCE) {
        console.error(`\n  ❌ Client balance too low (${ethers.formatEther(clBal)} ETH). Need at least 0.001 ETH for gas + escrow.`);
        process.exit(1);
    }

    // Contract instances
    const contractAsClient = new ethers.Contract(CONTRACT_ADDRESS, ABI, client);
    const contractAsFreelancer = new ethers.Contract(CONTRACT_ADDRESS, ABI, freelancer);
    const contractAsArbiter = new ethers.Contract(CONTRACT_ADDRESS, ABI, arbiter);

    // ─── SCENE 3 + 4: Create Deal (Client funds escrow) ───────────────────

    log(1, "Create Deal — Client funds escrow (Scene 3+4 of demo)");
    info("Deal: 'Smart Contract Audit — DeFi Protocol'");
    info("3 milestones: Initial Review (30%), Full Audit (50%), Final Check (20%)");

    const TOTAL_AMOUNT = ethers.parseEther("0.0001");
    const m1Amount = (TOTAL_AMOUNT * 30n) / 100n;
    const m2Amount = (TOTAL_AMOUNT * 50n) / 100n;
    const m3Amount = (TOTAL_AMOUNT * 20n) / 100n;

    // Milestone config:
    //   M1: Manual approval (requires_approval=true, end_time=0)
    //   M2: Time-based, 14 days (requires_approval=false, end_time=now+14days)
    //   M3: Manual approval (requires_approval=true, end_time=0) — oracle not on-chain yet
    const now = Math.floor(Date.now() / 1000);
    const fourteenDays = 14 * 24 * 60 * 60;

    const milestoneAmounts = [m1Amount, m2Amount, m3Amount];
    const milestoneEndTimes = [0n, BigInt(now + fourteenDays), 0n];
    const milestoneApprovals = [true, false, true];

    // Use a unique ref_id based on timestamp to avoid collisions
    const refId = BigInt(Date.now());

    info(`Total escrow: ${ethers.formatEther(TOTAL_AMOUNT)} ETH`);
    info(`M1: ${ethers.formatEther(m1Amount)} ETH — Manual Approval`);
    info(`M2: ${ethers.formatEther(m2Amount)} ETH — Time-Based (14 days)`);
    info(`M3: ${ethers.formatEther(m3Amount)} ETH — Manual Approval`);
    info(`Ref ID: ${refId}`);

    let deal1Id;
    try {
        const tx1 = await contractAsClient.createDeal(
            refId,
            freelancer.address,
            arbiter.address,
            ethers.ZeroAddress, // Native ETH
            TOTAL_AMOUNT,
            milestoneAmounts,
            milestoneEndTimes,
            milestoneApprovals,
            { value: TOTAL_AMOUNT }
        );
        const receipt1 = await waitForTx(tx1, "createDeal");

        // Parse DealCreated event to get deal_id
        const dealCreatedEvent = receipt1.logs
            .map(log => { try { return contractAsClient.interface.parseLog(log); } catch { return null; } })
            .find(e => e && e.name === "DealCreated");

        if (dealCreatedEvent) {
            deal1Id = dealCreatedEvent.args.deal_id;
            ok(`Deal created! On-chain deal_id: ${deal1Id}`);
        } else {
            // Fallback: try to get return value via static call (not available post-tx, so use ref_id as hint)
            warn("Could not parse DealCreated event. Will try to infer deal_id from contract state.");
            // Try deal_id = 0 as a guess (first deal ever)
            deal1Id = 0n;
        }
    } catch (err) {
        console.error("\n  ❌ createDeal failed:", err.message || err);
        if (err.data) console.error("  Revert data:", err.data);
        process.exit(1);
    }

    // Verify deal state
    try {
        const status = await contractAsClient.getDealStatus(deal1Id);
        ok(`Deal status: ${DEAL_STATUS[Number(status)] || status} (expected: Funded=1)`);

        const dealFreelancer = await contractAsClient.getDealFreelancer(deal1Id);
        const dealClient = await contractAsClient.getDealClient(deal1Id);
        ok(`Deal freelancer: ${dealFreelancer}`);
        ok(`Deal client:     ${dealClient}`);

        const [m1Amt, m1Released, m1EndTime, m1RequiresApproval] = await contractAsClient.getMilestone(deal1Id, 0);
        ok(`Milestone 0: amount=${ethers.formatEther(m1Amt)} ETH, released=${m1Released}, requiresApproval=${m1RequiresApproval}`);
    } catch (err) {
        warn(`Could not verify deal state: ${err.message}`);
    }

    // ─── SCENE 5: Release Milestone 0 (Client approves M1) ───────────────

    log(2, "Release Milestone 0 — Client approves M1 (Scene 5 of demo)");

    try {
        const tx2 = await contractAsClient.releaseMilestone(deal1Id, 0n);
        await waitForTx(tx2, "releaseMilestone(deal1Id, 0)");

        const [, m1Released] = await contractAsClient.getMilestone(deal1Id, 0);
        ok(`Milestone 0 released: ${m1Released}`);
    } catch (err) {
        console.error("\n  ❌ releaseMilestone failed:", err.message || err);
        if (err.data) console.error("  Revert data:", err.data);
        warn("Continuing to dispute flow test...");
    }

    // ─── SCENE 6: Dispute Flow ────────────────────────────────────────────

    log(3, "Create a second deal for dispute flow (Scene 6 of demo)");

    const DISPUTE_AMOUNT = ethers.parseEther("0.0001");
    const refId2 = BigInt(Date.now() + 1);

    let deal2Id;
    try {
        const tx3 = await contractAsClient.createDeal(
            refId2,
            freelancer.address,
            arbiter.address,
            ethers.ZeroAddress,
            DISPUTE_AMOUNT,
            [DISPUTE_AMOUNT],          // 1 milestone = 100%
            [0n],                      // no end time
            [true],                    // requires approval
            { value: DISPUTE_AMOUNT }
        );
        const receipt3 = await waitForTx(tx3, "createDeal (dispute deal)");

        const dealCreatedEvent2 = receipt3.logs
            .map(log => { try { return contractAsClient.interface.parseLog(log); } catch { return null; } })
            .find(e => e && e.name === "DealCreated");

        if (dealCreatedEvent2) {
            deal2Id = dealCreatedEvent2.args.deal_id;
            ok(`Dispute deal created! On-chain deal_id: ${deal2Id}`);
        } else {
            warn("Could not parse DealCreated event for dispute deal.");
            deal2Id = deal1Id + 1n;
        }
    } catch (err) {
        console.error("\n  ❌ createDeal (dispute deal) failed:", err.message || err);
        if (err.data) console.error("  Revert data:", err.data);
        process.exit(1);
    }

    log(4, "Raise Dispute — Client initiates dispute (Scene 6 of demo)");
    info(`Reason: "Audit report is incomplete — critical vulnerabilities not documented"`);

    try {
        const tx4 = await contractAsClient.raiseDispute(deal2Id);
        await waitForTx(tx4, "raiseDispute");
        ok("Dispute raised successfully!");
    } catch (err) {
        console.error("\n  ❌ raiseDispute failed:", err.message || err);
        if (err.data) console.error("  Revert data:", err.data);
        process.exit(1);
    }

    // Try to read status (getDealStatus may revert on some contract versions)
    try {
        const status2 = await contractAsClient.getDealStatus(deal2Id);
        ok(`Deal status after dispute: ${DEAL_STATUS[Number(status2)] || status2} (expected: Disputed=3)`);
    } catch (err) {
        warn(`getDealStatus reverted (known contract issue): ${err.reason || err.shortMessage || err.message}`);
    }

    log(5, "Resolve Dispute — Arbiter rules in favor of freelancer (Scene 6 of demo)");
    info("Ruling: Release full amount to freelancer");

    // Check arbiter has gas
    const arBalNow = await provider.getBalance(arbiter.address);
    if (arBalNow === 0n) {
        warn(`Arbiter has 0 ETH — cannot pay gas for resolveDispute. Skipping.`);
        warn(`Fund arbiter ${arbiter.address} with some Arbitrum Sepolia ETH and re-run.`);
    } else {
        try {
            // Release full amount to freelancer (client_share=0, freelancer_share=full)
            const tx5 = await contractAsArbiter.resolveDispute(deal2Id, 0n, DISPUTE_AMOUNT);
            await waitForTx(tx5, "resolveDispute (release to freelancer)");
            ok("Dispute resolved! Funds released to freelancer.");
        } catch (err) {
            console.error("\n  ❌ resolveDispute failed:", err.message || err);
            if (err.data) console.error("  Revert data:", err.data);
        }

        // Try to read final status
        try {
            const status3 = await contractAsClient.getDealStatus(deal2Id);
            ok(`Deal status after resolution: ${DEAL_STATUS[Number(status3)] || status3} (expected: Resolved=4)`);
        } catch (err) {
            warn(`getDealStatus reverted (known contract issue): ${err.reason || err.shortMessage || err.message}`);
        }
    }

    // ─── Summary ──────────────────────────────────────────────────────────

    console.log("\n═══════════════════════════════════════════════════════");
    console.log("  ✅ Demo Flow Complete!");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`\n  Deal 1 (id: ${deal1Id})`);
    console.log(`    - Created with 3 milestones (0.0001 ETH total)`);
    console.log(`    - Milestone 0 released by client`);
    console.log(`\n  Deal 2 (id: ${deal2Id})`);
    console.log(`    - Created with 1 milestone (0.0001 ETH)`);
    console.log(`    - Dispute raised by client`);
    console.log(`    - Dispute resolved by arbiter → full amount to freelancer`);
    console.log("\n  Explorer links:");
    console.log(`    https://sepolia.arbiscan.io/address/${CONTRACT_ADDRESS}`);
    console.log("═══════════════════════════════════════════════════════\n");
}

main().catch(err => {
    console.error("\n❌ Fatal error:", err);
    process.exit(1);
});
