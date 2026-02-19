import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { status, contract_deal_id } = await request.json();

        console.log('[API] Updating deal status:', { id, status, contract_deal_id });

        // Validate status
        if (!['pending', 'funded', 'completed', 'disputed'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

        // Update object
        const updateData: any = { status };
        if (contract_deal_id !== undefined) {
            updateData.contract_deal_id = contract_deal_id;
        }

        // Update deal status
        const { data, error } = await supabase
            .from('deals')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        console.log('[API] Update result:', { data, error });

        if (error) {
            console.error('[API] Failed to update status:', error);
            return NextResponse.json(
                { error: 'Failed to update deal status', details: error.message },
                { status: 500 }
            );
        }

        console.log('[API] Status updated successfully');
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] Error updating deal status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
