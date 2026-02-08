export default function SecuritySection() {
    return (
        <section id="security" className="py-24 px-4 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-4xl font-header mb-6">
                        Trustless by Design
                        <span className="block text-accent-purple font-serif italic lowercase mt-2">arbitrated by code</span>
                    </h2>
                    <div className="space-y-8">
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Smart Contract Security</h3>
                                <p className="text-gray-400">Funds are held in a secure, audited Stylus smart contract. Neither ArbiSecure nor the freelancer can access funds until the release condition is met.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Fair Dispute Resolution</h3>
                                <p className="text-gray-400">In case of a disagreement, our "Arbiter" mechanism ensures a fair outcome via a neutral third-party check (2-of-3 multi-sig logic), protecting both parties.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-accent-purple/20 blur-[100px] rounded-full opacity-50"></div>
                    <div className="relative bg-glass backdrop-blur-md border border-glass-border rounded-card p-6 font-mono text-sm leading-relaxed text-gray-300 overflow-hidden">
                        <div className="flex gap-2 mb-4 text-gray-500">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div>
                            <span className="text-accent-pink">pub fn</span> <span className="text-accent-blue">deposit</span>(amount: U256) {'{'}
                            <br />
                            &nbsp;&nbsp;<span className="text-gray-500">// Funds locked in contract</span>
                            <br />
                            &nbsp;&nbsp;<span className="text-accent-purple">self</span>.balance += amount;
                            <br />
                            &nbsp;&nbsp;<span className="text-accent-purple">self</span>.state = State::Locked;
                            <br />
                            {'}'}
                            <br /><br />
                            <span className="text-accent-pink">pub fn</span> <span className="text-accent-blue">release</span>() {'{'}
                            <br />
                            &nbsp;&nbsp;<span className="text-accent-pink">if</span> msg.sender == client {'{'}
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;transfer_to_freelancer();
                            <br />
                            &nbsp;&nbsp;{'}'}
                            <br />
                            {'}'}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
