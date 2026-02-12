import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { CreateDealInput } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body: CreateDealInput = await request.json();

        // Validate required fields
        const { freelancer, client, amount, arbiter, title } = body;
        if (!freelancer || !client || !amount || !arbiter || !title) {
            return NextResponse.json(
                { error: 'Missing required fields: freelancer, client, amount, arbiter, title' },
                { status: 400 }
            );
        }

        // Insert deal into database
        const { data, error } = await supabase
            .from('deals')
            .insert({
                freelancer,
                client,
                amount,
                arbiter,
                title,
                description: body.description || '',
                milestones: body.milestones || [],
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: `Database error: ${error.message || 'Failed to create deal'}` },
                { status: 500 }
            );
        }

        // Generate shareable link
        const link = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/deal/${data.id}`;

        return NextResponse.json({
            dealId: data.id,
            link
        });
    } catch (error) {
        console.error('Error creating deal:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
