
interface CardProps {
    name: string;
    price: string;
    change: string;
    color: string;
    logo: string;
}

const Card = ({ name, price, change, color, logo }: CardProps) => {
    // Map color names to specific Tailwind classes for the glow effect
    const glowColors: Record<string, string> = {
        pink: "bg-pink-500",
        cyan: "bg-cyan-500",
        purple: "bg-purple-500",
        lime: "bg-lime-500",
    };

    const glowColor = glowColors[color] || "bg-white";
    const isPositive = !change.startsWith("-");

    return (
        <div className="relative group h-[340px] rounded-card p-6 bg-glass border border-glass-border overflow-hidden transition-all hover:-translate-y-2 hover:bg-glass-hover hover:border-white/20">
            {/* Decorative Glow */}
            <div className={`absolute top-0 right-0 w-48 h-48 ${glowColor} opacity-10 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none transition-opacity group-hover:opacity-20`} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/5">
                            <img alt={`${name} Logo`} className="w-8 h-8 opacity-80" src={logo} />
                        </div>
                        <span className={`font-mono text-xs px-2 py-1 rounded-full bg-white/5 border border-white/5 ${isPositive ? 'text-accent-green' : 'text-red-400'}`}>
                            {change}%
                        </span>
                    </div>
                </div>

                <div>
                    <h3 className="font-header text-2xl mb-1">{name}</h3>
                    <p className="font-mono text-2xl text-gray-300">{price}</p>
                </div>
            </div>

            {/* Subltle grid pattern overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[length:24px_24px] opacity-[0.02] pointer-events-none"></div>
        </div>
    );
};

export default function CryptoCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4 md:px-8 pb-12 max-w-7xl mx-auto">
            <Card
                name="Polkadot"
                price="$0.0870"
                change="+1.89"
                color="pink"
                logo="https://lh3.googleusercontent.com/aida-public/AB6AXuDclhtq_RPgvBOPHmB7I6W-45Qg6CKLeHrWp0U3rxgr5wT86Ol9IJWwDbhVg1H1UCpcB6i5qLB48lKzZ3v2eum4WagM1_6ZdWvBGaB1nZD0wn2DFYafpCzMC_zTEAHuOyo6YrkFbHLrrBXXGfa9G-cDytQYdOoYUgniDr63KNNv1NehphWHR6p17ydB5ZDD4c-_ZRpFka6ifHbc9mAwyvQ_1BsQlaj37s_unlrJ03vcLq6Gavido1XajA6VSIArAkqkVV5yDuym0zQN"
            />
            <Card
                name="Cardano"
                price="$51.53"
                change="+2.55"
                color="cyan"
                logo="https://lh3.googleusercontent.com/aida-public/AB6AXuARLOHbLSDdRSZPAAj0_76eo9h8F_F05I_f-IMDWKXM-HQ-7l6dP5Igzof0WbQqeXOELmLQU_Ti2ttM7QacyDyP5vXhqB5Th3WlWMFgm5UaDaVqdultBbG4rOgSo5W9iFkyh-ZwVd2HTZNMuKTbRVxHbEQXB6U32pd4CgYUkiduvnUBme2PXptHQ-GFg0m3Y3CloAeqoswiNKI9Ljk-pcjRvv-yDW0cjl8lADASOLidyzSS5f2Yz-_AaerIfK2MtotkGeDNMbHPoRa3"
            />
            <Card
                name="Solana"
                price="$51.56"
                change="+3.15"
                color="purple"
                logo="https://lh3.googleusercontent.com/aida-public/AB6AXuBXonZ7F7ry5H-RZ0P3x_4QDH5X0to_0oSx55sPoW0rzkQC-2sdac_7fHhq-GBwAyio7lzaMvFc7sIw5mmil3KTwNsbZeB7tZqg8pBSglw-ZaKxK-QAwVQBB6nFNgYm3Zo957EZqdnvZUmqR1j_Y4Ad2s7ewsq69tJieI9GtVz0m_9ADHnKAyF1cUnjYZ-Dh3BWbT5PRvb0vNOnQabamoIcL2QoF0kWp_w3z4TSpAmhZVa_OM5kRWIC_g5Dot6KV0_GwnNFjBVYidps"
            />
            <Card
                name="Bitcoin"
                price="$52,345"
                change="-4.75"
                color="lime"
                logo="https://lh3.googleusercontent.com/aida-public/AB6AXuDnKDl51iHVCjw86gf_E4IuENNvumP7KT8M2oiN1dLpBc7mf68LwUTNje7gGgF4TCPr-oXkORK-XhjhOexIxsZxRHPoi2QY8myL0o2f-p7Sd59qLzFfbrU57F2jj_MomEt6CH9A2_OReXZLmH_wO3euGYzMvIxf4leQG7Fg2srv75_Rp7Hl-nwwRNSY44z9tuCw5Bv7W8T96Ft7Spid62ECpobAnTo6nnU_lkVVngZ8aeHlC7dP45hIC5w42GTkWnR-mJd3-N664KVI"
            />
        </div>
    );
}
