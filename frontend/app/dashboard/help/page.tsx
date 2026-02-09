'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Link from 'next/link';

type FAQItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export default function HelpPage() {
  const [expandedId, setExpandedId] = useState<string>('faq-1');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'Getting Started',
      question: 'How do I create my first deal?',
      answer:
        'Navigate to Dashboard > Create Deal, fill in the freelancer address, amount, currency, arbiter address, and project scope. Review the terms and submit. You\'ll receive a unique Deal ID for reference.',
    },
    {
      id: 'faq-2',
      category: 'Getting Started',
      question: 'What wallet do I need?',
      answer:
        'any Ethereum-compatible wallet works (MetaMask, WalletConnect, Coinbase Wallet, etc.). ArbiSecure supports the Arbitrum Sepolia testnet for development.',
    },
    {
      id: 'faq-3',
      category: 'Deals & Transactions',
      question: 'What happens after I release funds?',
      answer:
        'Once you release funds as the client, the freelancer receives them immediately. The deal is marked as complete, and both parties can rate each other.',
    },
    {
      id: 'faq-4',
      category: 'Deals & Transactions',
      question: 'Can I cancel a deal?',
      answer:
        'Before funds are released, both parties can mutually agree to cancel. Contact your arbiter for assistance. Once released, funds cannot be returned.',
    },
    {
      id: 'faq-5',
      category: 'Disputes',
      question: 'How do I open a dispute?',
      answer:
        'From the deal details page, click "Initiate Dispute", provide evidence and explanation, and confirm. The assigned arbiter will review and make a binding decision.',
    },
    {
      id: 'faq-6',
      category: 'Disputes',
      question: 'What happens during dispute resolution?',
      answer:
        'The arbiter reviews evidence from both parties and decides fund distribution (Full refund, Partial split, or Full release). The decision is final and binding.',
    },
    {
      id: 'faq-7',
      category: 'Fees & Pricing',
      question: 'How much does ArbiSecure charge?',
      answer:
        'ArbiSecure charges a 1% platform fee on successful completed deals. There are no additional fees for creating deals, disputes, or cancellations.',
    },
    {
      id: 'faq-8',
      category: 'Fees & Pricing',
      question: 'Do arbiters get paid?',
      answer:
        'Yes, arbiters earn 30% of the platform fee from disputes they resolve. This incentivizes fair and timely resolutions.',
    },
    {
      id: 'faq-9',
      category: 'Security',
      question: 'Is my money safe in ArbiSecure?',
      answer:
        'Funds are stored in a smart contract vault managed by the arbitration system. Funds cannot be released without agreement from the client or arbiter decision.',
    },
    {
      id: 'faq-10',
      category: 'Security',
      question: 'Can I trust the arbiter?',
      answer:
        'Arbiters are selected from a pool of trusted, verified addresses with strong track records. All decisions are immutable and stored on-chain.',
    },
    {
      id: 'faq-11',
      category: 'Account',
      question: 'How do I update my profile?',
      answer:
        'Go to Dashboard > Profile & Settings. You can edit your display name, bio, avatar emoji, and security settings like 2FA.',
    },
    {
      id: 'faq-12',
      category: 'Account',
      question: 'Can I connect multiple wallets?',
      answer:
        'Currently, you can only connect one wallet per session. Disconnect and reconnect to switch wallets. Multi-wallet support is coming soon.',
    },
  ];

  const filtered = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-400 mb-8">
          <Link href="/dashboard" className="hover:text-slate-300 transition">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Help & FAQ</span>
        </div>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Help & FAQ</h1>
          <p className="text-slate-400">Find answers to common questions about ArbiSecure</p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <input
            type="text"
            placeholder="Search FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-2xl bg-slate-800/50 border border-slate-700 rounded-xl px-6 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 sticky top-24">
              <h3 className="font-bold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition text-sm"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - FAQ */}
          <div className="lg:col-span-3 space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>No results found. Try a different search.</p>
              </div>
            ) : (
              filtered.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === faq.id ? '' : faq.id)}
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-800/50 transition"
                  >
                    <div className="text-left flex-1">
                      <p className="text-xs text-slate-500 font-semibold mb-2">{faq.category}</p>
                      <p className="text-white font-semibold">{faq.question}</p>
                    </div>
                    <div className={`text-2xl ml-4 transition ${expandedId === faq.id ? 'rotate-180' : ''}`}>
                      {expandedId === faq.id ? '△' : '▽'}
                    </div>
                  </button>

                  {expandedId === faq.id && (
                    <div className="px-6 pb-6 text-slate-300 border-t border-slate-700 pt-4">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-linear-to-r from-blue-900/20 via-purple-900/20 to-slate-900/20 border border-slate-700 rounded-xl p-10">
          <h2 className="text-2xl font-bold text-white mb-4">Still need help?</h2>
          <p className="text-slate-300 mb-6 max-w-2xl">
            Can't find the answer? Our support team is here to help. Contact us for assistance with your account, deals, or technical issues.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
              📧 Email Support
            </button>
            <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition">
              💬 Live Chat
            </button>
            <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition">
              📚 Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
