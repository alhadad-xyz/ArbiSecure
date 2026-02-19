import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

async function main() {
    const client = createPublicClient({
        chain: arbitrumSepolia,
        transport: http("https://sepolia-rollup.arbitrum.io/rpc")
    });

    const contractAddress = "0x4C27770495f9D11C98B53020acbcaBF2C44E714A" as `0x${string}`;

    console.log(`\n🔍 Checking contract bytecode...\n`);

    try {
        const bytecode = await client.getBytecode({ address: contractAddress });

        if (!bytecode || bytecode === '0x') {
            console.log("❌ No bytecode found - contract doesn't exist or was destroyed!");
        } else {
            console.log(`✅ Contract exists`);
            console.log(`   Bytecode length: ${bytecode.length} characters`);
            console.log(`   First 66 chars: ${bytecode.substring(0, 66)}`);
        }

        // Also check current block
        const block = await client.getBlockNumber();
        console.log(`\n📦 Current block number: ${block}`);

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
