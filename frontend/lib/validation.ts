import { isAddress } from "viem";

export function validateEthAddress(address: string): boolean {
    if (!address) return false;
    return isAddress(address);
}

export function validateAmount(amount: string): boolean {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num < 1000000; // Max 1M ETH
}

export function validateDealForm(
    client: string,
    amount: string,
    arbiter: string,
    freelancer: string
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Client validation
    if (!client) {
        errors.push("Client wallet address is required");
    } else if (!validateEthAddress(client)) {
        errors.push("Client address is not a valid Ethereum address");
    } else if (client.toLowerCase() === freelancer.toLowerCase()) {
        errors.push("Client cannot be the same as freelancer");
    }

    // Amount validation
    if (!amount) {
        errors.push("Amount is required");
    } else if (!validateAmount(amount)) {
        errors.push("Amount must be greater than 0 and less than 1,000,000 ETH");
    }

    // Arbiter validation
    if (!arbiter) {
        errors.push("Arbiter wallet address is required");
    } else if (!validateEthAddress(arbiter)) {
        errors.push("Arbiter address is not a valid Ethereum address");
    } else if (arbiter.toLowerCase() === freelancer.toLowerCase()) {
        errors.push("Arbiter cannot be the same as freelancer");
    } else if (arbiter.toLowerCase() === client.toLowerCase()) {
        errors.push("Arbiter cannot be the same as client");
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
