
import { ethers } from "ethers";

const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

// Client (Sender)
const CLIENT_KEY = "0x9e3aacc6ec546a80e38c54cdd1d13fb9c5ac8de97af1db7879a6f78b1da267b0";
// Arbiter (Receiver)
const ARBITER_ADDRESS = "0x53A4441309d747DC378d001fD92a2a949d84BB49";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(CLIENT_KEY, provider);

    const balance = await provider.getBalance(wallet.address);
    console.log(`Client Balance: ${ethers.formatEther(balance)} ETH`);

    const amountToSend = ethers.parseEther("0.01");

    if (balance < amountToSend) {
        console.error("Insufficient balance to fund arbiter");
        process.exit(1);
    }

    console.log(`Sending 0.01 ETH to Arbiter (${ARBITER_ADDRESS})...`);

    const tx = await wallet.sendTransaction({
        to: ARBITER_ADDRESS,
        value: amountToSend
    });

    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log("Transaction confirmed!");

    const arbiterBalance = await provider.getBalance(ARBITER_ADDRESS);
    console.log(`New Arbiter Balance: ${ethers.formatEther(arbiterBalance)} ETH`);
}

main().catch(console.error);
