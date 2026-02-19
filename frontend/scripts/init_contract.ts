import { createWalletClient, createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { ARBISECURE_ABI } from "../lib/abi";

const CONTRACT_ADDRESS = "0x85e00908bbf09ae656aa553b027a490eb42a54cc" as `0x${string}`;
const PRIVATE_KEY = "0x9e3aacc6ec546a80e38c54cdd1d13fb9c5ac8de97af1db7879a6f78b1da267b0";

async function main() {
    console.log("\n🔧 Initializing contract...\n");

    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

    const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const walletClient = createWalletClient({
        account,
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    console.log(`Contract: ${CONTRACT_ADDRESS}`);
    console.log(`Caller: ${account.address}\n`);

    // Check current admin
    const currentAdmin = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "admin",
        args: []
    });

    console.log(`Current admin: ${currentAdmin}`);

    if (currentAdmin !== '0x0000000000000000000000000000000000000000') {
        console.log("\n✅ Contract already initialized!");
        return;
    }

    // Initialize
    console.log("\n📝 Calling initialize()...");

    const block = await publicClient.getBlock();
    const baseFee = block.baseFeePerGas || 0n;
    const maxFeePerGas = (baseFee * 13n) / 10n;
    const maxPriorityFeePerGas = baseFee / 10n;

    const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "initialize",
        args: [],
        maxFeePerGas,
        maxPriorityFeePerGas
    });

    console.log(`   ✅ Transaction sent: ${hash}`);
    console.log(`   ⏳ Waiting for confirmation...`);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status !== 'success') {
        console.error("   ❌ Transaction failed!");
        return;
    }

    console.log(`   ✅ Initialized! Block: ${receipt.blockNumber}\n`);

    // Verify
    const newAdmin = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "admin",
        args: []
    });

    console.log(`✅ New admin: ${newAdmin}\n`);
}

main();
