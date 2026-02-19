import { createWalletClient, createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { ARBISECURE_ABI } from "../lib/abi";
import { config } from "dotenv";

config({ path: "../.env", override: true });

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ PRIVATE_KEY not found in .env");
        return;
    }

    const account = privateKeyToAccount(privateKey.startsWith('0x') ? privateKey as `0x${string}` : `0x${privateKey}` as `0x${string}`);

    const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const walletClient = createWalletClient({
        account,
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const contractAddress = "0x4C27770495f9D11C98B53020acbcaBF2C44E714A" as `0x${string}`;

    console.log(`\n🚀 Initializing contract at ${contractAddress}...`);
    console.log(`   Using account: ${account.address}\n`);

    try {
        // Call initialize()
        const hash = await walletClient.writeContract({
            address: contractAddress,
            abi: ARBISECURE_ABI,
            functionName: "initialize",
            args: []
        });

        console.log(`✅ Transaction sent: ${hash}`);
        console.log(`   Waiting for confirmation...`);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
            console.log(`\n✅ Contract initialized successfully!`);
            console.log(`   Block: ${receipt.blockNumber}`);
            console.log(`   Gas used: ${receipt.gasUsed}`);

            // Verify
            const admin = await publicClient.readContract({
                address: contractAddress,
                abi: ARBISECURE_ABI,
                functionName: "admin",
                args: []
            });
            console.log(`\n   New admin: ${admin}`);
        } else {
            console.log(`\n❌ Transaction failed`);
        }

    } catch (e: any) {
        console.error("❌ Error:", e.shortMessage || e.message);
    }
}

main();
