-- Allow message_ar to be nullable (make English the primary/required field)
ALTER TABLE top_bar_messages ALTER COLUMN message_ar DROP NOT NULL;

-- Ensure message_en is required
ALTER TABLE top_bar_messages ALTER COLUMN message_en SET NOT NULL;
