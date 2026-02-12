"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Milestone, calculateMilestoneAmount, generateMilestoneId, MILESTONE_TEMPLATES } from "@/lib/types";
import GlassInput from "./GlassInput";

interface MilestoneBuilderProps {
    totalAmount: string;
    milestones: Milestone[];
    onChange: (milestones: Milestone[]) => void;
}

export default function MilestoneBuilder({ totalAmount, milestones, onChange }: MilestoneBuilderProps) {
    const [showTemplates, setShowTemplates] = useState(false);

    const addMilestone = () => {
        const newMilestone: Milestone = {
            id: generateMilestoneId(),
            title: `Milestone ${milestones.length + 1}`,
            percentage: 0,
            amount: "0",
            conditions: []
        };
        onChange([...milestones, newMilestone]);
    };

    const removeMilestone = (id: string) => {
        if (milestones.length <= 1) return; // Keep at least 1
        onChange(milestones.filter(m => m.id !== id));
    };

    const updateMilestone = (id: string, updates: Partial<Milestone>) => {
        onChange(milestones.map(m => {
            if (m.id === id) {
                const updated = { ...m, ...updates };
                // Recalculate amount if percentage changed
                if (updates.percentage !== undefined) {
                    updated.amount = calculateMilestoneAmount(totalAmount, updated.percentage);
                }
                return updated;
            }
            return m;
        }));
    };

    const applyTemplate = (templateIndex: number) => {
        const template = MILESTONE_TEMPLATES[templateIndex];
        const newMilestones: Milestone[] = template.milestones.map((tm, index) => ({
            id: generateMilestoneId(),
            title: tm.title,
            percentage: tm.percentage,
            amount: calculateMilestoneAmount(totalAmount, tm.percentage),
            conditions: []
        }));
        onChange(newMilestones);
        setShowTemplates(false);
    };

    const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);
    const isValid = totalPercentage === 100;

    return (
        <div className="space-y-6">
            {/* Template button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-xs font-mono text-white/60 hover:text-white transition-colors border border-white/10 hover:border-white/40 rounded px-3 py-1"
                >
                    📋 Templates
                </button>
            </div>

            {/* Template selector */}
            <AnimatePresence>
                {showTemplates && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        {MILESTONE_TEMPLATES.map((template, index) => (
                            <button
                                key={index}
                                onClick={() => applyTemplate(index)}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 text-left transition-all"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-mono text-sm">{template.name}</p>
                                        <p className="text-gray-400 text-xs">{template.description}</p>
                                    </div>
                                    <div className="text-white/40 text-xs font-mono">
                                        {template.milestones.map(m => m.percentage).join('/')}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress indicator */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                    <span className={isValid ? "text-green-400" : "text-yellow-400"}>
                        {isValid ? "✓ Total: 100%" : `Total: ${totalPercentage}%`}
                    </span>
                    <span className="text-gray-400">
                        {milestones.length} milestone{milestones.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                    {milestones.map((milestone, index) => (
                        <div
                            key={milestone.id}
                            className={`h-full transition-all ${milestone.percentage > 0
                                ? 'bg-white/80 shadow-[0_0_8px_-2px_rgba(255,255,255,0.4)]'
                                : 'bg-white/20'
                                }`}
                            style={{ width: `${milestone.percentage}%` }}
                        />
                    ))}
                </div>
            </div>

            {/* Milestone list */}
            <div className="space-y-4">
                <AnimatePresence>
                    {milestones.map((milestone, index) => (
                        <motion.div
                            key={milestone.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-white/40 font-mono text-xs">#{index + 1}</span>
                                <div className="flex-grow">
                                    <GlassInput
                                        value={milestone.title}
                                        onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                                        placeholder="Milestone name"
                                    />
                                </div>
                                {milestones.length > 1 && (
                                    <button
                                        onClick={() => removeMilestone(milestone.id)}
                                        className="text-red-400 hover:text-red-300 text-xs font-mono"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3 items-end">
                                <div className="flex-grow">
                                    <label className="text-gray-400 font-mono text-xs uppercase mb-2 block">
                                        Percentage
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={milestone.percentage}
                                        onChange={(e) => updateMilestone(milestone.id, { percentage: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-transparent border-b border-white/20 text-white placeholder-white/20 focus:outline-none focus:border-white transition-all py-2 font-mono text-lg"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <label className="text-gray-400 font-mono text-xs uppercase mb-2 block">
                                        Amount (ETH)
                                    </label>
                                    <div className="text-white font-header text-lg py-2 border-b border-white/10">
                                        {milestone.amount}
                                    </div>
                                </div>
                            </div>

                            {milestone.conditions.length > 0 && (
                                <div className="pt-2 border-t border-white/10">
                                    <p className="text-xs text-gray-400 font-mono">
                                        {milestone.conditions.length} condition{milestone.conditions.length !== 1 ? 's' : ''} configured
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add milestone button */}
            <button
                onClick={addMilestone}
                className="w-full border border-dashed border-white/20 hover:border-white/40 rounded-xl py-4 text-white/60 hover:text-white transition-all font-mono text-sm"
            >
                + Add Milestone
            </button>
        </div>
    );
}
