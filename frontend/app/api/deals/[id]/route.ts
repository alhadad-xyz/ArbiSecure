import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        console.log('[API] Fetching deal with ID:', id);

        // Fetch deal from database
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .eq('id', id)
            .single();

        console.log('[API] Supabase response:', { data, error });

        if (error || !data) {
            console.log('[API] Deal not found or error:', error);
            return NextResponse.json(
                { error: 'Deal not found', details: error?.message },
                { status: 404 }
            );
        }

        console.log('[API] Deal found, returning data');
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] Error fetching deal:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
