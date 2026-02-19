
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const dealId = id;
        const body = await req.json();
        const { reason, evidence_links, initiator_address } = body;

        if (!reason || !initiator_address) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create dispute record
        const { data, error } = await supabase
            .from('disputes')
            .insert([
                {
                    deal_id: dealId,
                    initiator_address,
                    reason,
                    evidence_links: evidence_links || [],
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating dispute:', error);
            return NextResponse.json(
                { error: 'Failed to create dispute record' },
                { status: 500 }
            );
        }

        // Update deal status to 'disputed'
        // This is redundant if the frontend calls the status update API, 
        // but good for consistency. However, the contract determines the real status.
        // We will update the DB status here just in case.
        const { error: updateError } = await supabase
            .from('deals')
            .update({ status: 'disputed' })
            .eq('id', dealId);

        if (updateError) {
            console.error('Error updating deal status:', updateError);
            // We don't fail the request if this fails, as the dispute record is created
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in dispute API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const dealId = id;

        const { data, error } = await supabase
            .from('disputes')
            .select('*')
            .eq('deal_id', dealId)
            // .single(); // There might be multiple disputes if resolved and raised again? 
            // For MVP, assuming one active dispute.
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Dispute not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching dispute:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
