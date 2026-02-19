
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from frontend/.env.local
dotenv.config({ path: path.resolve(__dirname, '../../frontend/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    console.error("URL:", supabaseUrl);
    console.error("KEY:", supabaseKey ? "FOUND" : "MISSING");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDeal() {
    const dealId = "2b9a6f88-146a-4223-a946-3cadfefbba75";
    console.log(`Checking deal: ${dealId}`);

    const { data: deal, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

    if (error) {
        console.error("Error fetching deal:", error);
    } else {
        console.log("Deal Data:");
        console.log("Status:", deal.status);
        console.log("Contract Deal ID:", deal.contract_deal_id);
    }

    // Check dispute table
    const { data: disputeData, error: disputeError } = await supabase
        .from('disputes')
        .select('*')
        .eq('deal_id', dealId);

    if (disputeError) {
        console.error("Error fetching dispute:", disputeError);
    } else {
        console.log("Dispute Data:", disputeData);
    }
}

checkDeal();
