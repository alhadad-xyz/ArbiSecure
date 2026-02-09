"use client";

import Header from "@/components/header";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function Home() {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal() || {};

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Hero Section */}
      <section className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-950 pt-20">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
            {/* Left - Content */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-sm font-semibold text-blue-400">Powered by Arbitrum</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Secure Escrow for Digital Deals
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed">
                  Build trust with smart contract-backed escrow. Release funds when work is complete, or resolve disputes with a neutral arbiter.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {address ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 text-center shadow-lg hover:shadow-xl"
                    >
                      Go to Dashboard
                    </Link>
                    <Link
                      href="/dashboard/create-deal"
                      className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 text-center"
                    >
                      Create a Deal
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openConnectModal?.()}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
                    >
                      Connect Wallet
                    </button>
                    <a
                      href="#features"
                      className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 text-center"
                    >
                      Learn More
                    </a>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div>
                  <p className="text-3xl font-bold text-white">$2.4M</p>
                  <p className="text-slate-400 text-sm">Secured</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">10,000+</p>
                  <p className="text-slate-400 text-sm">Users</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">99.9%</p>
                  <p className="text-slate-400 text-sm">Uptime</p>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full aspect-square">
                {/* Gradient circles background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-10 right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl" />
                  <div className="absolute bottom-10 left-20 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl" />
                  <div className="absolute top-40 left-40 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl" />
                </div>

                {/* Card illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl max-w-sm w-full">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">EscrowSecure</span>
                        <span className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 bg-white/10 rounded w-3/4" />
                        <div className="h-3 bg-white/10 rounded w-1/2" />
                      </div>
                      <div className="bg-white/10 rounded-lg p-4 space-y-2">
                        <div className="h-2 bg-white/20 rounded w-full" />
                        <div className="h-2 bg-white/20 rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">Simple, secure, and transparent</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-slate-600 transition">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Deposit Funds</h3>
              <p className="text-slate-400">Client deposits funds into a smart contract vault. Funds are secured and locked.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-slate-600 transition">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Complete Work</h3>
              <p className="text-slate-400">Freelancer completes the work. Both parties verify completion and quality.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-slate-600 transition">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🔓</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Release or Dispute</h3>
              <p className="text-slate-400">Client releases funds or initiates dispute. Arbiter resolves conflicts fairly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-linear-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="bg-linear-to-r from-blue-900/20 via-purple-900/20 to-slate-900/20 border border-slate-700 rounded-2xl p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                  Institutional-Grade Security
                </h2>
                <p className="text-lg text-slate-300 mb-8">
                  Every transaction is protected by audited smart contracts on Arbitrum. Your funds are secure from the moment they enter the vault.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-slate-300">Smart contracts audited and verified</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-slate-300">Decentralized escrow mechanism</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-slate-300">Neutral arbiter system</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-slate-300">Non-custodial funds management</span>
                  </li>
                </ul>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <div className="w-full aspect-square bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                  <span className="text-8xl">🔒</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple Pricing</h2>
            <p className="text-xl text-slate-400">No hidden fees. Pay only when you transact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
              <p className="text-slate-400 text-sm mb-2">Service Fee</p>
              <p className="text-3xl font-bold text-white">1%</p>
              <p className="text-slate-400 text-sm mt-2">Per transaction</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
              <p className="text-slate-400 text-sm mb-2">Min Amount</p>
              <p className="text-3xl font-bold text-white">$10</p>
              <p className="text-slate-400 text-sm mt-2">USD equivalent</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
              <p className="text-slate-400 text-sm mb-2">Dispute Fee</p>
              <p className="text-3xl font-bold text-white">Free</p>
              <p className="text-slate-400 text-sm mt-2">Arbiter review included</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-linear-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4">
          <div className="bg-linear-to-r from-blue-600/80 to-purple-600/80 rounded-2xl p-12 lg:p-16 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Secure Your Next Deal?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of freelancers and clients who trust EscrowSecure for secure transactions.
            </p>
            {address ? (
              <Link
                href="/dashboard/create-deal"
                className="inline-block px-10 py-4 bg-white hover:bg-slate-100 text-blue-600 font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
              >
                Create Your First Deal
              </Link>
            ) : (
              <button
                onClick={() => openConnectModal?.()}
                className="px-10 py-4 bg-white hover:bg-slate-100 text-blue-600 font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
              >
                Connect Wallet to Get Started
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚖️</span>
                </div>
                <h3 className="text-lg font-bold text-white">EscrowSecure</h3>
              </div>
              <p className="text-slate-400 text-sm">Secure escrow for digital deals</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-slate-300 transition">How It Works</a></li>
                <li><a href="#" className="hover:text-slate-300 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-300 transition">Security</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-slate-300 transition">About</a></li>
                <li><a href="#" className="hover:text-slate-300 transition">Blog</a></li>
                <li><a href="#" className="hover:text-slate-300 transition">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-slate-300 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-300 transition">Terms</a></li>
                <li><a href="#" className="hover:text-slate-300 transition">Disclaimer</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© 2024 EscrowSecure. Built on Arbitrum. Secure payments for the decentralized web.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
