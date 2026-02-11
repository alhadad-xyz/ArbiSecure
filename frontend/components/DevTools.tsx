'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Wrench, X, Zap } from 'lucide-react';

interface DevAction {
    label: string;
    action: () => void;
    icon?: string;
}

export default function DevTools() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    // Get page-specific actions
    const getActions = (): DevAction[] => {
        if (pathname === '/create') {
            return [
                {
                    label: '⚡ Fill Basic Deal',
                    action: () => fillCreateDealForm('basic'),
                },
                {
                    label: '🔥 Fill Complex Deal (3 Milestones)',
                    action: () => fillCreateDealForm('complex'),
                },
                {
                    label: '🎯 Fill 50/50 Deal',
                    action: () => fillCreateDealForm('5050'),
                },
            ];
        }

        if (pathname?.startsWith('/deal/')) {
            return [
                {
                    label: '✅ Mock Deal Funded',
                    action: () => console.log('Mock deal funded'),
                },
            ];
        }

        return [
            {
                label: '🔧 No actions for this page',
                action: () => { },
            },
        ];
    };

    const fillCreateDealForm = (type: 'basic' | 'complex' | '5050') => {
        const testData = {
            basic: {
                title: 'Smart Contract Audit',
                description: 'Full security audit of DeFi protocol',
                totalAmount: '0.5',
                freelancer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                client: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                arbiter: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
            },
            complex: {
                title: 'Full Stack dApp Development',
                description: 'Build complete DeFi platform with smart contracts and frontend',
                totalAmount: '5.0',
                freelancer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                client: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                arbiter: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
            },
            '5050': {
                title: 'Website Redesign',
                description: 'Modern UI/UX redesign with responsive layout',
                totalAmount: '1.0',
                freelancer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                client: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                arbiter: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
            },
        };

        const data = testData[type];

        // Fill visible inputs using DOM manipulation
        setTimeout(() => {
            const inputs = document.querySelectorAll('input:not([type="hidden"])');
            const textareas = document.querySelectorAll('textarea');

            // Helper to set value and trigger React events
            const setValue = (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    'value'
                )?.set;

                if (element instanceof HTMLInputElement && nativeInputValueSetter) {
                    nativeInputValueSetter.call(element, value);
                } else {
                    element.value = value;
                }

                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
            };

            // Find and fill inputs by placeholder
            let filledCount = 0;
            inputs.forEach((inputEl) => {
                if (!(inputEl instanceof HTMLInputElement)) return;
                const placeholder = inputEl.placeholder.toLowerCase();

                // Title field - check for "e.g." pattern or "title"/"agreement"
                if (placeholder.includes('e.g.') || placeholder.includes('title') || placeholder.includes('agreement')) {
                    setValue(inputEl, data.title);
                    filledCount++;
                }
                // Amount fields
                else if (placeholder.includes('amount') || placeholder.includes('0.00')) {
                    setValue(inputEl, data.totalAmount);
                    filledCount++;
                }
                // Freelancer address
                else if (placeholder.includes('freelancer') || placeholder.includes('gets paid')) {
                    setValue(inputEl, data.freelancer);
                    filledCount++;
                }
                // Client address
                else if (placeholder.includes('client') || placeholder.includes('fund')) {
                    setValue(inputEl, data.client);
                    filledCount++;
                }
                // Arbiter address
                else if (placeholder.includes('arbiter') || placeholder.includes('dispute')) {
                    setValue(inputEl, data.arbiter);
                    filledCount++;
                }
            });

            textareas.forEach((textareaEl) => {
                if (!(textareaEl instanceof HTMLTextAreaElement)) return;
                const placeholder = textareaEl.placeholder.toLowerCase();
                if (placeholder.includes('description') || placeholder.includes('detail')) {
                    setValue(textareaEl, data.description);
                    filledCount++;
                }
            });

            console.log(`✅ Dev Tools: Filled ${filledCount} field(s) on current step with "${type}" preset`);
        }, 100);
    };

    const actions = getActions();

    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-6 right-6 z-50 group"
                title="Open Dev Tools"
            >
                <div className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300">
                    <Wrench className="w-5 h-5 text-white" />
                </div>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl overflow-hidden backdrop-blur-xl bg-black/80 border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Wrench className="w-4 h-4 text-white/60" />
                        <span className="text-white font-mono text-xs font-bold uppercase tracking-wider">Dev Tools</span>
                    </div>
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all duration-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Current Page Info */}
            <div className="px-5 py-3 bg-white/5 border-b border-white/10">
                <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1">Current Route</div>
                <div className="text-sm text-white/80 font-mono truncate">{pathname}</div>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-3 px-1">Quick Actions</div>
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.action}
                        className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white/90 rounded-lg transition-all duration-200 text-left font-mono text-sm border border-white/10 hover:border-white/30"
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-white/5 border-t border-white/10">
                <div className="text-[10px] text-white/30 font-mono flex items-center gap-2">
                    <Zap className="w-3 h-3 text-white/40" />
                    <span className="uppercase tracking-wider">Development Mode</span>
                </div>
            </div>
        </div>
    );
}
