-- Add 'disputed' to the allowed status values for deals
ALTER TABLE "deals" DROP CONSTRAINT IF EXISTS "deals_status_check";

ALTER TABLE "deals"
    ADD CONSTRAINT "deals_status_check" 
    CHECK (status IN ('pending', 'funded', 'active', 'released', 'disputed', 'completed', 'cancelled'));
