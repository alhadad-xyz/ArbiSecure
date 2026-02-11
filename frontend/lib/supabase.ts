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
    status: 'pending' | 'funded' | 'completed';
    created_at: string;
    updated_at: string;
}

export type CreateDealInput = Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'contract_deal_id' | 'status'>;

