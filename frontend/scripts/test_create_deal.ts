import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import { ARBISECURE_ABI, CONTRACT_ADDRESS, PLATFORM_ARBITER_ADDRESS } from '../lib/abi';

// Provided Private Key
const PRIVATE_KEY = '9e3aacc6ec546a80e38c54cdd1d13fb9c5ac8de97af1db7879a6f78b1da267b0';
const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);

async function main() {
    const CONTRACT_ADDRESS = "0xeb58dbe176614c0ee4a5ab9f070160b0a5e50520";
    console.log(`Using account: ${account.address}`);
    console.log(`Contract: ${CONTRACT_ADDRESS}`);

    const client = createPublicClient({
        chain: arbitrumSepolia,
        transport: http()
    });

    const walletClient = createWalletClient({
        account,
        chain: arbitrumSepolia,
        transport: http()
    });

    // Deal Parameters
    const amount = parseEther('0.001'); // Small amount for test
    const freelancer = account.address; // Self-deal for test
    const arbiter = PLATFORM_ARBITER_ADDRESS;
    const token = "0x0000000000000000000000000000000000000000"; // ETH

    // Milestones
    const milestoneAmounts = [amount];
    const milestoneEndTimes = [0n]; // uint64
    const milestoneApprovals = [true];

    // ABI expects uint64 for end_times. Viem handles BigInts fine.

    const balance = await client.getBalance({ address: account.address });
    console.log(`Balance: ${formatEther(balance)} ETH`);

    if (balance < amount) {
        console.error("Insufficient balance for trade!");
        return;
    }

    // Try Initialize (just to check connectivity/gas)
    try {
        console.log("Simulating initialize...");
        await client.simulateContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: 'initialize',
            account
        });
        console.log("Initialize simulation success (or already initialized)");
    } catch (e) {
        console.log("Initialize skipped/failed (likely already initialized or auth):", e.message.split('\n')[0]);
    }

    try {
        console.log("Estimating gas for create_deal...");
        const gasEstimate = await client.estimateContractGas({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: 'createDeal',
            args: [
                0n, // ref_id
                freelancer,
                arbiter,
                token,
                amount,
                milestoneAmounts,
                milestoneEndTimes,
                [1n] // milestoneApprovals (Vec<U256>)
            ],
            value: amount,
            account
        });

        console.log(`Gas Estimate: ${gasEstimate.toString()}`);

        console.log("Sending transaction...");
        const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: 'createDeal',
            args: [
                0n,
                freelancer,
                arbiter,
                token,
                amount,
                milestoneAmounts,
                milestoneEndTimes,
                [1n]
            ],
            value: amount
        });

        console.log(`Transaction sent! Hash: ${hash}`);
        console.log("Waiting for confirmation...");

        const receipt = await client.waitForTransactionReceipt({ hash });

        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`Effective Gas Price: ${formatEther(receipt.effectiveGasPrice)} ETH`);
        console.log(`Total Cost: ${formatEther(receipt.gasUsed * receipt.effectiveGasPrice)} ETH`);

    } catch (error) {
        console.error("Error creating deal:", error);
    }
}

main();
