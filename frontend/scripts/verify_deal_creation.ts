
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Manually parse .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
            process.env[key] = value;
        }
    });
    console.log(`Loaded env from ${envPath}`);
} catch (e) {
    console.warn("Could not load .env.local via manual parse", e);
}

import { createPublicClient, http, parseEther, formatEther } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { supabase } from '../lib/supabase';
// Dynamic import for ABI will be done in main to ensure env is loaded

async function main() {
    const { ARBISECURE_ABI, CONTRACT_ADDRESS } = await import('../lib/abi');
    console.log("Initializing verification...");

    // 1. Fetch latest pending deal
    console.log("Fetching latest pending deal from Supabase...");
    const { data: deals, error } = await supabase
        .from('deals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error fetching deals:", error);
        process.exit(1);
    }

    if (!deals || deals.length === 0) {
        console.log("No pending deals found to verify.");
        process.exit(0);
    }

    const deal = deals[0];
    console.log(`Found Deal: ${deal.title} (ID: ${deal.id})`);
    console.log(`Amount: ${deal.amount} ETH`);
    console.log(`Client: ${deal.client}`);
    console.log(`Freelancer: ${deal.freelancer}`);
    console.log(`Arbiter: ${deal.arbiter}`);

    // 2. Prepare Args (Replicating Frontend Logic)
    console.log("Preparing contract arguments...");

    // Parse total amount
    const parsedAmount = parseEther(deal.amount);
    console.log(`Parsed Total Amount (wei): ${parsedAmount.toString()}`);

    // Parse Milestones
    const milestones = deal.milestones || [];
    let accumulatedAmount = BigInt(0);
    const milestoneAmounts: bigint[] = [];

    milestones.forEach((m: any, index: number) => {
        if (index === milestones.length - 1) {
            // Last milestone gets remainder
            const remainder = parsedAmount - accumulatedAmount;
            milestoneAmounts.push(remainder);
            console.log(`Milestone ${index} (Last): ${formatEther(remainder)} ETH (Remainder)`);
        } else {
            // Logic matches frontend: use percentage if available, else amount
            let amountVal: bigint;
            let amountStr = m.amount ? m.amount.toString() : "0";

            if ((amountStr === "0" || !m.amount) && m.percentage) {
                amountVal = (parsedAmount * BigInt(m.percentage)) / BigInt(100);
                console.log(`Milestone ${index}: Calculated from ${m.percentage}% -> ${formatEther(amountVal)} ETH`);
            } else {
                amountVal = parseEther(amountStr);
                console.log(`Milestone ${index}: Parsed from amount ${amountStr} -> ${formatEther(amountVal)} ETH`);
            }
            milestoneAmounts.push(amountVal);
            accumulatedAmount += amountVal;
        }
    });

    // Check sum
    const totalMilestones = milestoneAmounts.reduce((a, b) => a + b, BigInt(0));
    console.log(`Total Milestone Sum: ${totalMilestones.toString()}`);
    console.log(`Expected Total:      ${parsedAmount.toString()}`);

    if (totalMilestones !== parsedAmount) {
        console.error("CRITICAL: Milestone sum mismatch inside script calculation!");
    } else {
        console.log("✅ Milestone sum matches total amount.");
    }

    const milestoneTitles = milestones.map((m: any) => m.title);
    const milestoneEndTimes = milestones.map(() => BigInt(0));
    const milestoneApprovals = milestones.map(() => true);
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

    const args = [
        BigInt(0), // _ref_id
        deal.freelancer as `0x${string}`,
        deal.arbiter as `0x${string}`,
        ZERO_ADDRESS, // token
        parsedAmount,
        milestoneAmounts,
        milestoneEndTimes,
        milestoneApprovals
    ];

    // 3. Simulate Contract Call
    console.log("\nSimulating contract call...");

    const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http()
    });

    console.log(`Checking contract at ${CONTRACT_ADDRESS}...`);
    const code = await publicClient.getBytecode({ address: CONTRACT_ADDRESS });
    if (!code || code === '0x') {
        console.error("❌ NO CODE found at contract address! Please check deployment.");
        process.exit(1);
    }
    console.log(`✅ Contract code found (${code.length} bytes).`);

    // Try a simple view function
    try {
        const dealId = BigInt(0); // Check deal 0 or just check if call works
        // We don't know if deal 0 exists, but calling it shouldn't revert with "execution reverted" unless deal doesn't exist AND code panics on access?
        // Let's call get_deal_client(0)
        // If deal 0 doesn't exist, it might return 0 address or panic?
        // checking lib.rs... `self.deals.getter(deal_id)` -> if not exists, returns default (0).
        // So it should work.

        console.log("Testing simple view function admin()...");
        const admin = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: 'admin',
            args: []
        });
        console.log(`✅ View call success. Admin: ${admin}`);
    } catch (e: any) {
        console.warn("⚠️ View call warning:", e.message.slice(0, 100));
        // It might be fine if it reverts for other reasons, but let's see.
    }

    try {
        console.log("Simulating contract call (REAL DATA)...");
        const { result } = await publicClient.simulateContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: 'createDeal',
            args: args as any,
            account: deal.client as `0x${string}`, // Simulate as client
            value: parsedAmount
        });

        console.log("✅ Simulation SUCCESS (Real Data)!");
        console.log("Result (Deal ID):", result.toString());
    } catch (err: any) {
        console.error("❌ Simulation FAILED (Real Data)");
        console.error("Reason:", err.message);
    }

    // Simplified Test
    try {
        console.log("\nSimulating contract call (SIMPLIFIED DATA - ZERO ARGS)...");
        const { result } = await publicClient.simulateContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: 'createDeal',
            args: [
                0n,
                deal.freelancer as `0x${string}`,
                deal.arbiter as `0x${string}`,
                ZERO_ADDRESS,
                100n,
                [100n],
                [0n],
                [true]
            ],
            account: deal.client as `0x${string}`,
            value: 100n
        });

        console.log("✅ Simulation SUCCESS (Simplified)!");
        console.log("Result (Deal ID):", result.toString());
    } catch (err: any) {
        console.error("❌ Simulation FAILED (Simplified)");
        console.error("Reason:", err.message);
    }
}

main();
