import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local', override: true });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

async function main() {
    const { data, error } = await supabase
        .from('deals')
        .select('id, contract_deal_id, status, amount, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error("Error fetching deal:", error);
        return;
    }

    console.log("Latest deal from database:");
    console.log(JSON.stringify(data, null, 2));

    if (data.contract_deal_id !== null) {
        console.log(`\nContract Deal ID: ${data.contract_deal_id}`);
        console.log("Will verify this on-chain...");
    } else {
        console.log("\n⚠️  contract_deal_id is null - deal not yet on chain");
    }
}

main();
