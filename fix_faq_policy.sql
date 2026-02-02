-- Allow update on faq_items table
-- First, drop existing policies to avoid conflicts if needed, or just add new ones correctly.
-- We will try to add a permissive policy for UPDATE.

BEGIN;

-- For faq_items
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow update access" ON faq_items;
CREATE POLICY "Allow update access" ON faq_items FOR UPDATE USING (true) WITH CHECK (true);

-- For pages (About, Contact, etc.)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow update access pages" ON pages;
CREATE POLICY "Allow update access pages" ON pages FOR UPDATE USING (true) WITH CHECK (true);

COMMIT;
