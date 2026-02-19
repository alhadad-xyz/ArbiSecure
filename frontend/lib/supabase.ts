import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use service key for server-side API routes, anon key as fallback for client-side
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Milestone {
    title: string;
    amount: string;
    percentage: number;
    description?: string;
    status?: 'pending' | 'released';
    conditions?: Array<{
        id: string;
        type: 'time' | 'oracle' | 'manual' | 'hybrid';
        description: string;
        daysAfterPrevious?: number;
        requiresClientApproval?: boolean;
        oracleType?: string;
        oracleUrl?: string;
        expectedValue?: string;
        anyConditionMet?: boolean;
    }>;
}

export interface Deal {
    id: string;
    freelancer: string;
    client: string;
    amount: string;
    arbiter: string;
    title: string;
    description: string;
    milestones: Milestone[];
    contract_deal_id?: number;
    status: DealStatus;
    created_at: string;
    updated_at: string;
}


export type DealStatus = 'pending' | 'funded' | 'active' | 'released' | 'disputed' | 'completed' | 'cancelled' | 'resolved';

export interface Dispute {
    id: string;
    deal_id: string;
    initiator_address: string;
    reason: string;
    evidence_links: string[];
    created_at: string;
}

export type CreateDealInput = Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'contract_deal_id' | 'status'>;
export type CreateDisputeInput = Omit<Dispute, 'id' | 'created_at'>;

