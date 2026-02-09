import Link from 'next/link';
import { useState, useEffect } from 'react';

interface TransactionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'release' | 'dispute' | 'resolve' | null;
  amount: string;
  currency: string;
  recipientAddress?: string;
  transactionHash?: string;
}

export default function TransactionSuccessModal({
  isOpen,
  onClose,
  action,
  amount,
  currency,
  recipientAddress = '0x7f1c9...8b0a21',
  transactionHash = '0x3a1fd8...0cc2de',
}: TransactionSuccessModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getActionDetails = () => {
    switch (action) {
      case 'release':
        return {
          title: 'Funds Released',
          description: 'The escrow conditions have been met and the funds have been successfully released to the recipient.',
          buttonText: 'Return to Dashboard',
          color: 'green',
        };
      case 'dispute':
        return {
          title: 'Dispute Initiated',
          description: 'Your dispute has been successfully submitted. The arbiter will review the case and make a determination.',
          buttonText: 'Return to Dashboard',
          color: 'orange',
        };
      case 'resolve':
        return {
          title: 'Dispute Resolved',
          description: 'The dispute resolution has been completed. Funds have been distributed according to the arbitration decision.',
          buttonText: 'Return to Dashboard',
          color: 'emerald',
        };
      default:
        return {
          title: 'Transaction Complete',
          description: 'Your transaction has been successfully processed.',
          buttonText: 'Return to Dashboard',
          color: 'green',
        };
    }
  };

  const details = getActionDetails();
  const colorClass = details.color === 'green' ? 'text-emerald-400' : details.color === 'orange' ? 'text-amber-400' : 'text-emerald-400';
  const borderColor = details.color === 'green' ? 'border-emerald-500/30' : details.color === 'orange' ? 'border-amber-500/30' : 'border-emerald-500/30';
  const bgColor = details.color === 'green' ? 'bg-emerald-500/10' : details.color === 'orange' ? 'bg-amber-500/10' : 'bg-emerald-500/10';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className={`bg-slate-900 border border-slate-700 rounded-2xl p-0 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-500 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header Background */}
        <div className={`relative h-32 sm:h-40 ${bgColor} border-b ${borderColor} flex items-center justify-center overflow-hidden flex-shrink-0`}>
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full ${bgColor} blur-3xl animate-pulse`} style={{ top: '-10px', right: '-10px' }} />
            <div className={`absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full ${bgColor} blur-3xl animate-pulse`} style={{ bottom: '-10px', left: '-10px', animationDelay: '1s' }} />
          </div>

          {/* Large Checkmark */}
          <div className={`relative z-10 w-16 h-16 sm:w-24 sm:h-24 rounded-full ${bgColor} border-2 ${borderColor} flex items-center justify-center animate-in zoom-in duration-700`}>
            <span className={`text-3xl sm:text-5xl ${colorClass}`}>✓</span>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Main Message */}
          <div className="text-center space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              Transaction
              <br />
              <span className={colorClass}>{details.title}</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-md mx-auto">
              {details.description}
            </p>
          </div>

          {/* Payment Details Card */}
          <div className={`${bgColor} border ${borderColor} rounded-xl p-4 sm:p-5 md:p-6 space-y-4`}>
            {/* Total Payout */}
            <div className="space-y-2">
              <p className="text-slate-400 text-xs font-semibold tracking-wider">TOTAL PAYOUT</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl md:text-3xl font-bold text-white">{amount}</span>
                <span className={`text-base sm:text-lg md:text-lg font-bold ${colorClass}`}>{currency}</span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm">CONFIRMED</p>
            </div>

            {/* Recipient Address */}
            <div className="pt-3 sm:pt-4 border-t border-slate-700/50">
              <p className="text-slate-400 text-xs font-semibold tracking-wider">RECIPIENT ADDRESS</p>
              <p className="text-slate-300 font-mono text-xs sm:text-sm mt-2 flex items-center gap-2 break-all">
                {recipientAddress}
                <span className="text-slate-500 cursor-pointer hover:text-slate-400 transition flex-shrink-0">📋</span>
              </p>
            </div>

            {/* Transaction ID */}
            <div className="pt-3 sm:pt-4 border-t border-slate-700/50">
              <p className="text-slate-400 text-xs font-semibold tracking-wider">TRANSACTION ID</p>
              <a
                href={`https://arbitrum.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${colorClass} font-mono text-xs sm:text-sm mt-2 flex items-center gap-2 hover:opacity-80 transition break-all group`}
              >
                <span>{transactionHash}</span>
                <span className="text-lg flex-shrink-0 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>

          {/* Network Status */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-slate-300 font-medium text-xs sm:text-sm">NETWORK STATUS</span>
            </div>
            <div className="text-emerald-400 font-semibold text-xs sm:text-sm flex-shrink-0">● Live</div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4">
            <a
              href={`https://arbiscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 text-sm sm:text-base ${
                details.color === 'green'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : details.color === 'orange'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <span className="text-base sm:text-lg">🔗</span>
              <span className="hidden sm:inline">View on Arbiscan</span>
              <span className="sm:hidden">Arbiscan</span>
            </a>
            <Link
              href="/dashboard"
              onClick={onClose}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-white bg-slate-700 hover:bg-slate-600 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span className="text-base sm:text-lg">↩️</span>
              <span className="hidden sm:inline">Return to Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
