"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MilestoneCondition, ConditionType, OracleType, generateConditionId } from "@/lib/types";
import GlassInput from "./GlassInput";
import { Clock, Link, Hand, Zap, ClipboardList, Info, X, ChevronDown, ChevronRight } from "lucide-react";

interface ConditionConfiguratorProps {
    milestoneIndex: number;
    milestoneName: string;
    conditions: MilestoneCondition[];
    onChange: (conditions: MilestoneCondition[]) => void;
}

export default function ConditionConfigurator({
    milestoneIndex,
    milestoneName,
    conditions,
    onChange
}: ConditionConfiguratorProps) {
    const [expandedConditionId, setExpandedConditionId] = useState<string | null>(null);

    const addCondition = (type: ConditionType) => {
        const newCondition: MilestoneCondition = {
            id: generateConditionId(),
            type,
            description: getDefaultDescription(type),
            ...(type === 'time' && { daysAfterPrevious: 7 }),
            ...(type === 'manual' && { requiresClientApproval: true }),
            ...(type === 'oracle' && { oracleType: 'api' as OracleType })
        };
        onChange([...conditions, newCondition]);
        setExpandedConditionId(newCondition.id);
    };

    const updateCondition = (id: string, updates: Partial<MilestoneCondition>) => {
        onChange(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const removeCondition = (id: string) => {
        onChange(conditions.filter(c => c.id !== id));
        if (expandedConditionId === id) {
            setExpandedConditionId(null);
        }
    };

    function getDefaultDescription(type: ConditionType): string {
        switch (type) {
            case 'time': return 'Auto-release after specified time';
            case 'oracle': return 'Verify external condition via oracle';
            case 'manual': return 'Requires client manual approval';
            case 'hybrid': return 'Combination of multiple conditions';
            default: return '';
        }
    }

    function getConditionIcon(type: ConditionType) {
        switch (type) {
            case 'time': return <Clock className="w-5 h-5" />;
            case 'oracle': return <Link className="w-5 h-5" />;
            case 'manual': return <Hand className="w-5 h-5" />;
            case 'hybrid': return <Zap className="w-5 h-5" />;
            default: return <ClipboardList className="w-5 h-5" />;
        }
    }

    return (
        <div className="space-y-6">
            {/* Milestone indicator */}
            <div className="text-gray-400 font-mono text-xs">
                Configuring: <span className="text-white">{milestoneName}</span>
            </div>

            {/* Condition type selector */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => addCondition('time')}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl p-4 text-left transition-all group"
                >
                    <div className="mb-2 text-white/70 group-hover:text-white transition-colors"><Clock className="w-6 h-6" /></div>
                    <div className="text-white font-mono text-sm group-hover:text-white/90">Time-Based</div>
                    <div className="text-gray-400 text-xs mt-1">Auto-release after X days</div>
                </button>

                <button
                    onClick={() => addCondition('oracle')}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl p-4 text-left transition-all group"
                >
                    <div className="mb-2 text-white/70 group-hover:text-white transition-colors"><Link className="w-6 h-6" /></div>
                    <div className="text-white font-mono text-sm group-hover:text-white/90">Oracle</div>
                    <div className="text-gray-400 text-xs mt-1">GitHub PR, API check</div>
                </button>

                <button
                    onClick={() => addCondition('manual')}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl p-4 text-left transition-all group"
                >
                    <div className="mb-2 text-white/70 group-hover:text-white transition-colors"><Hand className="w-6 h-6" /></div>
                    <div className="text-white font-mono text-sm group-hover:text-white/90">Manual</div>
                    <div className="text-gray-400 text-xs mt-1">Client approval required</div>
                </button>

                <button
                    onClick={() => addCondition('hybrid')}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl p-4 text-left transition-all group"
                >
                    <div className="mb-2 text-white/70 group-hover:text-white transition-colors"><Zap className="w-6 h-6" /></div>
                    <div className="text-white font-mono text-sm group-hover:text-white/90">Hybrid</div>
                    <div className="text-gray-400 text-xs mt-1">Combine conditions</div>
                </button>
            </div>

            {/* Conditions list */}
            {conditions.length > 0 && (
                <div className="space-y-3">
                    <AnimatePresence>
                        {conditions.map((condition, index) => (
                            <motion.div
                                key={condition.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
                            >
                                {/* Condition header */}
                                <div
                                    onClick={() => setExpandedConditionId(expandedConditionId === condition.id ? null : condition.id)}
                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-white/70">{getConditionIcon(condition.type)}</span>
                                        <div>
                                            <p className="text-white font-mono text-sm capitalize">{condition.type} Condition</p>
                                            <p className="text-gray-400 text-xs">{condition.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeCondition(condition.id);
                                            }}
                                            className="text-red-400 hover:text-red-300 text-xs font-mono px-2"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-white/40 text-xs">
                                            {expandedConditionId === condition.id ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                        </span>
                                    </div>
                                </div>

                                {/* Condition details (expanded) */}
                                <AnimatePresence>
                                    {expandedConditionId === condition.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-white/10"
                                        >
                                            <div className="p-4 space-y-4">
                                                {/* Time-based config */}
                                                {condition.type === 'time' && (
                                                    <div className="space-y-3">
                                                        <GlassInput
                                                            label="Days After Previous Milestone"
                                                            type="number"
                                                            value={condition.daysAfterPrevious?.toString() || ''}
                                                            onChange={(e) => updateCondition(condition.id, {
                                                                daysAfterPrevious: parseInt(e.target.value) || 0
                                                            })}
                                                            placeholder="7"
                                                        />
                                                        <p className="text-xs text-gray-500 font-mono flex items-start gap-1">
                                                            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Funds will auto-release {condition.daysAfterPrevious || 0} days after {milestoneIndex === 0 ? 'deal creation' : 'previous milestone'}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Oracle-based config */}
                                                {condition.type === 'oracle' && (
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-gray-400 font-mono text-xs uppercase mb-2 block">Oracle Type</label>
                                                            <select
                                                                value={condition.oracleType || 'api'}
                                                                onChange={(e) => updateCondition(condition.id, {
                                                                    oracleType: e.target.value as OracleType
                                                                })}
                                                                className="w-full bg-white/5 border border-white/20 text-white rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:border-white/40"
                                                            >
                                                                <option value="github">GitHub (PR merged, commit exists)</option>
                                                                <option value="api">API Health Check</option>
                                                                <option value="custom">Custom Oracle</option>
                                                            </select>
                                                        </div>

                                                        <GlassInput
                                                            label="URL / Identifier"
                                                            value={condition.oracleUrl || ''}
                                                            onChange={(e) => updateCondition(condition.id, { oracleUrl: e.target.value })}
                                                            placeholder="https://api.example.com/health"
                                                        />

                                                        <GlassInput
                                                            label="Expected Value"
                                                            value={condition.expectedValue || ''}
                                                            onChange={(e) => updateCondition(condition.id, { expectedValue: e.target.value })}
                                                            placeholder="200 (status code)"
                                                        />
                                                    </div>
                                                )}

                                                {/* Manual approval config */}
                                                {condition.type === 'manual' && (
                                                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                                        <p className="text-white font-mono text-sm mb-2 flex items-center gap-2"><Hand className="w-4 h-4" /> Client Manual Approval</p>
                                                        <p className="text-gray-400 text-xs">
                                                            Client must manually approve this milestone release. No automatic conditions.
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Hybrid config */}
                                                {condition.type === 'hybrid' && (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={condition.anyConditionMet || false}
                                                                onChange={(e) => updateCondition(condition.id, {
                                                                    anyConditionMet: e.target.checked
                                                                })}
                                                                className="w-4 h-4"
                                                            />
                                                            <label className="text-white font-mono text-sm">
                                                                Release when ANY condition is met (OR logic)
                                                            </label>
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-mono flex items-start gap-1">
                                                            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                                            {condition.anyConditionMet
                                                                ? 'Funds release when ANY condition is satisfied'
                                                                : 'Funds release when ALL conditions are satisfied (AND logic)'}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Description override */}
                                                <GlassInput
                                                    label="Description (Optional)"
                                                    value={condition.description}
                                                    onChange={(e) => updateCondition(condition.id, { description: e.target.value })}
                                                    placeholder="Describe this condition..."
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Empty state */}
            {conditions.length === 0 && (
                <div className="text-center py-8 text-gray-400 font-mono text-sm">
                    No conditions added yet. Choose a type above to get started.
                </div>
            )}
        </div>
    );
}
