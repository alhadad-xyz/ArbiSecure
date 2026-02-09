'use client';

import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Header from "./header";
import WalletDropdown from "./walletDropdown";

type DealFormData = {
  freelancer: string;
  amount: string;
  currency: "ETH" | "USDC";
  arbiter: string;
  scope: string;
};

type CreateDealFormProps = {
  onCreate: (deal: { client: string; arbiter: string }) => void;
};

export default function CreateDealForm({ onCreate }: CreateDealFormProps) {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal() || {};

  const { disconnect } = useDisconnect();

  const [form, setForm] = useState<DealFormData>({
    freelancer: "",
    amount: "",
    currency: "ETH",
    arbiter: "0x8A7...,982",
    scope: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCurrencyChange = (currency: "ETH" | "USDC") => {
    setForm({
      ...form,
      currency,
    });
  };

  const isValidAddress = (addr: string) =>
    /^0x[a-fA-F0-9]{40}$/.test(addr);

  const validate = () => {
    if (!address) return "Please connect your wallet first";
    if (!isValidAddress(form.freelancer)) return "Freelancer address invalid";
    if (!form.amount || Number(form.amount) <= 0)
      return "Amount must be greater than 0";
    if (!form.scope || form.scope.trim().length < 10)
      return "Please describe the scope of work";
    return null;
  };

  const generateDealId = () => {
    return `DEAL-${Date.now()}`;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const dealId = generateDealId();
      await fakeTx();

      setSuccess(`Deal created successfully (ID: ${dealId}) - ${form.amount} ${form.currency}`);
      onCreate({ client: address!, arbiter: form.arbiter });
    } catch {
      setError("Failed to create deal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />
      <div className="flex flex-1 bg-slate-950">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 bg-linear-to-b from-slate-900 to-slate-800 p-8 lg:p-12 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="text-sm text-slate-400 mb-8">
            Dashboard / <span className="text-slate-300">Create Deal</span>
          </div>

          {/* Title + Wallet */}
          <div className="mb-10 flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">Build Portfolio Site</h2>
              <p className="text-slate-400">Setup a secure escrow contract for your project.</p>
            </div>

            <div>
              {/* Shared Wallet Dropdown */}
              <WalletDropdown address={address} openConnectModal={openConnectModal} disconnect={disconnect} />
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Freelancer Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Freelancer Wallet Address</label>
              <div className="relative">
                <input
                  name="freelancer"
                  value={form.freelancer}
                  onChange={handleChange}
                  placeholder="0x... or ENS name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300">
                  📋
                </button>
              </div>
            </div>

            {/* Deposit Amount & Currency */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Deposit Amount</label>
                <input
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value as "ETH" | "USDC")}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option>ETH (Ethereum)</option>
                  <option>USDC</option>
                </select>
              </div>
            </div>

            {/* Arbiter */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Arbiter</label>
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
                <div className="flex-1">
                  <p className="text-white font-medium">Platform Arbiter</p>
                  <p className="text-slate-400 text-sm">{form.arbiter}</p>
                </div>
                <div className="text-green-400 text-xl">✓</div>
              </div>
            </div>

            {/* Scope of Work */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Scope of Work</label>
              <textarea
                name="scope"
                value={form.scope}
                onChange={handleChange}
                placeholder="Describe the deliverables or paste a link to the project specification..."
                rows={5}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm font-medium">⚠️ {error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                <p className="text-green-400 text-sm font-medium">✓ {success}</p>
              </div>
            )}

            {/* Button */}
            <button
              onClick={() => {
                if (!address && openConnectModal) {
                  openConnectModal();
                } else if (address) {
                  handleSubmit();
                }
              }}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-100 disabled:bg-slate-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              {!address ? "🔗 Connect Wallet First" : loading ? "Initializing Deal..." : "Initialize Deal"}
            </button>

            {/* Gas Estimate */}
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <span>⚡</span>
              <span>Gas Estimate • &lt; $0.01 • Powered by Arbitrum Stylus</span>
            </div>

            {/* Footer */}
            <div className="text-slate-500 text-xs pt-4 border-t border-slate-700">
              <p>© 2024 EscrowSecure. Secure payments for the decentralized web</p>
            </div>
          </div>
        </div>

        {/* Right Side - Hero */}
        <div className="hidden lg:flex w-1/2 bg-linear-to-br from-emerald-200 via-emerald-100 to-teal-200 relative overflow-hidden items-center justify-center p-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-md">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-emerald-900">100% Secure</span>
              <span className="text-xs text-emerald-800">Smart Contract Audited</span>
            </div>

            {/* Image Placeholder */}
            <div className="mb-10 h-64 bg-white/30 rounded-2xl backdrop-blur-sm border border-white/50 shadow-xl" />

            {/* Main Headline */}
            <h2 className="text-5xl font-light text-emerald-950 mb-8 italic leading-tight">
              Secure your next collaboration with <strong className="font-bold">low-cost escrow</strong> powered by Stylus.
            </h2>

            {/* Trust Indicator */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex -space-x-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-600 border-2 border-white/50"
                  />
                ))}
              </div>
              <div>
                <p className="font-semibold text-emerald-950">Trusted by 10,000+ freelancers</p>
                <p className="text-sm text-emerald-800">Join the future of work</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function fakeTx() {
  return new Promise((resolve) => setTimeout(resolve, 1500));
}
