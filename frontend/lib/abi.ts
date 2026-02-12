export const ARBISECURE_ABI = [
    {
        "type": "function",
        "name": "create_deal",
        "inputs": [
            { "name": "freelancer", "type": "address" },
            { "name": "amount", "type": "uint256" },
            { "name": "arbiter", "type": "address" }
        ],
        "outputs": [{ "name": "deal_id", "type": "uint256" }],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "deposit",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "release",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "initiate_dispute",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "arbiter_resolve",
        "inputs": [
            { "name": "deal_id", "type": "uint256" },
            { "name": "release_to_freelancer", "type": "bool" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "get_deal_status",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [{ "name": "status", "type": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "get_deal_amount",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [{ "name": "amount", "type": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "get_deal_freelancer",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [{ "name": "freelancer", "type": "address" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "get_deal_client",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [{ "name": "client", "type": "address" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "get_deal_arbiter",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [{ "name": "arbiter", "type": "address" }],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "DealCreated",
        "inputs": [
            { "name": "deal_id", "type": "uint256", "indexed": true },
            { "name": "client", "type": "address", "indexed": false },
            { "name": "freelancer", "type": "address", "indexed": false },
            { "name": "amount", "type": "uint256", "indexed": false }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "DealFunded",
        "inputs": [
            { "name": "deal_id", "type": "uint256", "indexed": true },
            { "name": "amount", "type": "uint256", "indexed": false }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "DealReleased",
        "inputs": [
            { "name": "deal_id", "type": "uint256", "indexed": true },
            { "name": "freelancer", "type": "address", "indexed": false },
            { "name": "amount", "type": "uint256", "indexed": false }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "DealDisputed",
        "inputs": [
            { "name": "deal_id", "type": "uint256", "indexed": true }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "DealResolved",
        "inputs": [
            { "name": "deal_id", "type": "uint256", "indexed": true },
            { "name": "released_to_freelancer", "type": "bool", "indexed": false }
        ],
        "anonymous": false
    }
] as const;

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "0x24df80ca332b7e229724e5d66092c4b292ce7dd7") as `0x${string}`;
export const PLATFORM_ARBITER_ADDRESS = (process.env.NEXT_PUBLIC_DEFAULT_ARBITER_ADDRESS || "0x1234567890123456789012345678901234567890") as `0x${string}`;
