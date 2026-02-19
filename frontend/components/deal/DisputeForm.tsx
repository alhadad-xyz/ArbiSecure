"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui";

interface DisputeFormProps {
    onSubmit: (data: { reason: string; evidence: string[] }) => Promise<void>;
    isSubmitting: boolean;
    onCancel: () => void;
}

interface FormData {
    reason: string;
    evidence1: string;
    evidence2: string;
    evidence3: string;
}

export default function DisputeForm({ onSubmit, isSubmitting, onCancel }: DisputeFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const onFormSubmit = (data: FormData) => {
        console.log("📝 [Form] Submitting dispute form...", data);
        const evidence = [data.evidence1, data.evidence2, data.evidence3].filter(link => link && link.trim() !== "");

        console.log("📝 [Form] Processed evidence:", evidence);

        onSubmit({
            reason: data.reason,
            evidence
        });
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div>
                <label className="text-sm font-mono text-gray-400 uppercase mb-2 block">
                    Reason for Dispute
                </label>
                <textarea
                    {...register("reason", { required: "Reason is required", maxLength: { value: 500, message: "Max 500 characters" } })}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all outline-none resize-none h-32"
                    placeholder="Describe why you are initiating a dispute..."
                />
                {errors.reason && <p className="text-red-400 text-xs mt-1">{errors.reason.message}</p>}
                <p className="text-xs text-gray-600 text-right mt-1">Max 500 characters</p>
            </div>

            <div>
                <label className="text-sm font-mono text-gray-400 uppercase mb-2 block">
                    Evidence Links (Optional)
                </label>
                <div className="space-y-3">
                    <input
                        {...register("evidence1")}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all outline-none text-sm font-mono"
                        placeholder="https://github.com/issue/123"
                    />
                    <input
                        {...register("evidence2")}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all outline-none text-sm font-mono"
                        placeholder="https://loom.com/..."
                    />
                    <input
                        {...register("evidence3")}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all outline-none text-sm font-mono"
                        placeholder="https://ipfs.io/ipfs/..."
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="ghost"
                    size="lg"
                    uppercase
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="danger"
                    size="lg"
                    uppercase
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit Dispute"}
                </Button>
            </div>
        </form>
    );
}
