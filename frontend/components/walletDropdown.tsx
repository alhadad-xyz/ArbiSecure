'use client';

import { useState, useEffect, useRef } from 'react';
import { useEnsName } from 'wagmi';

type Props = {
  address?: string;
  openConnectModal?: () => void;
  disconnect?: () => void;
  showBadge?: boolean;
};

export default function WalletDropdown({ address, openConnectModal, disconnect, showBadge = true }: Props) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const { data: ensName } = useEnsName({ address: address as `0x${string}` | undefined });

  const short = (addr?: string) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard?.writeText(address);
    setToast('Address copied');
    setOpen(false);
    setTimeout(() => setToast(null), 2000);
  };

  const handleDisconnect = () => {
    disconnect?.();
    setOpen(false);
  };

  if (!address) {
    return (
      <div>
        <button
          onClick={() => openConnectModal?.()}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-3">
        {showBadge && (
          <div className="inline-flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-slate-200 font-medium">{short(address)}</span>
          </div>
        )}

        <button
          onClick={() => setOpen((s) => !s)}
          className="w-9 h-9 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition"
        >
          {address ? address.slice(2, 4).toUpperCase() : 'U'}
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 shadow-lg z-50">
          <div className="break-all">{ensName ?? address}</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="px-2 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs transition"
            >
              Copy
            </button>
            <button
              onClick={handleDisconnect}
              className="px-2 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs transition"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute right-0 -bottom-10 bg-black/70 text-white text-xs px-3 py-1 rounded">{toast}</div>
      )}
    </div>
  );
}
