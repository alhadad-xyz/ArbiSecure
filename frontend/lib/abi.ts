export const ARBISECURE_ABI = [
    {
        "type": "function",
        "name": "initialize",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
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
            { "name": "milestone_approvals", "type": "uint256[]" }
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
        "name": "getDealArbiter",
        "inputs": [{ "name": "deal_id", "type": "uint256" }],
        "outputs": [{ "name": "arbiter", "type": "address" }],
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
        "name": "admin",
        "inputs": [],
        "outputs": [{ "name": "admin", "type": "address" }],
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
            { "name": "end_timestamp", "type": "uint64" },
            { "name": "requires_approval", "type": "bool" }
        ],
        "stateMutability": "view"
    }
] as const;

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "0x2119a6c68af14bdf442a749f4a0a1c775927568a") as `0x${string}`;
export const PLATFORM_ARBITER_ADDRESS = (process.env.NEXT_PUBLIC_DEFAULT_ARBITER_ADDRESS || "0x1234567890123456789012345678901234567890") as `0x${string}`;
