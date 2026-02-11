// Type definitions for V3 milestone-based deals

export type ConditionType = 'time' | 'oracle' | 'manual' | 'hybrid';
export type OracleType = 'github' | 'api' | 'custom';

export interface MilestoneCondition {
    id: string;
    type: ConditionType;
    description: string;

    // Time-based conditions
    daysAfterPrevious?: number;
    hoursAfterPrevious?: number;

    // Oracle-based conditions
    oracleType?: OracleType;
    oracleUrl?: string;
    expectedValue?: string;

    // Manual approval
    requiresClientApproval?: boolean;

    // Hybrid
    anyConditionMet?: boolean; // true = OR logic, false = AND logic
}

export interface Milestone {
    id: string;
    title: string;
    percentage: number;
    amount: string; // calculated from totalAmount * percentage
    description?: string;
    conditions: MilestoneCondition[];
}

export interface DealFormData {
    // Basic info
    title: string;
    description: string;

    // Financial
    totalAmount: string;

    // Parties
    freelancer: string;
    client: string;
    arbiter: string;

    // V3: Milestones
    milestones: Milestone[];
}

// Helper type for validation
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

// Preset milestone templates
export interface MilestoneTemplate {
    name: string;
    description: string;
    milestones: Array<{
        title: string;
        percentage: number;
        defaultConditions?: Partial<MilestoneCondition>[];
    }>;
}

export const MILESTONE_TEMPLATES: MilestoneTemplate[] = [
    {
        name: 'Two-Phase (50/50)',
        description: 'Equal split for simple projects',
        milestones: [
            { title: 'Initial Deposit', percentage: 50 },
            { title: 'Final Payment', percentage: 50 }
        ]
    },
    {
        name: 'Three-Phase (30/50/20)',
        description: 'Design, Development, Testing',
        milestones: [
            { title: 'Design Phase', percentage: 30 },
            { title: 'Development', percentage: 50 },
            { title: 'Testing & Deploy', percentage: 20 }
        ]
    },
    {
        name: 'Four-Phase (25/25/25/25)',
        description: 'Quarterly milestones',
        milestones: [
            { title: 'Milestone 1', percentage: 25 },
            { title: 'Milestone 2', percentage: 25 },
            { title: 'Milestone 3', percentage: 25 },
            { title: 'Milestone 4', percentage: 25 }
        ]
    }
];

// Validation helpers
export function validateMilestones(milestones: Milestone[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if at least one milestone exists
    if (milestones.length === 0) {
        errors.push('At least one milestone is required');
    }

    // Check if percentages sum to 100
    const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);
    if (totalPercentage !== 100) {
        errors.push(`Milestone percentages must sum to 100% (currently ${totalPercentage}%)`);
    }

    // Check if each milestone has at least one condition
    milestones.forEach((milestone, index) => {
        if (milestone.conditions.length === 0) {
            warnings.push(`Milestone ${index + 1} (${milestone.title}) has no release conditions`);
        }
    });

    // Check for valid percentages
    milestones.forEach((milestone, index) => {
        if (milestone.percentage <= 0) {
            errors.push(`Milestone ${index + 1} must have a percentage greater than 0`);
        }
        if (milestone.percentage > 100) {
            errors.push(`Milestone ${index + 1} cannot exceed 100%`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

export function calculateMilestoneAmount(totalAmount: string, percentage: number): string {
    const total = parseFloat(totalAmount);
    if (isNaN(total) || total <= 0) return '0';
    return ((total * percentage) / 100).toFixed(4);
}

export function generateMilestoneId(): string {
    return `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateConditionId(): string {
    return `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
