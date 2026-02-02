-- ============================================
-- MISSING TABLE: TOP BAR MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS top_bar_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_en TEXT NOT NULL,
  message_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE top_bar_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'top_bar_messages' AND policyname = 'Public can read top_bar_messages'
    ) THEN
        CREATE POLICY "Public can read top_bar_messages" ON top_bar_messages FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'top_bar_messages' AND policyname = 'Admins can manage top_bar_messages'
    ) THEN
        CREATE POLICY "Admins can manage top_bar_messages" ON top_bar_messages FOR ALL USING (is_admin());
    END IF;
END
$$;
