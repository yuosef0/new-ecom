-- ========================================
-- Initialize Site Settings
-- ========================================
-- Run this script to add default settings for Sale Timer and Social Media

-- Sale Timer (disabled by default)
INSERT INTO site_settings (key, value)
VALUES (
  'sale_timer',
  '{
    "is_active": false,
    "end_date": "",
    "title": "SALE ENDS SOON"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Social Media Links (empty by default)
INSERT INTO site_settings (key, value)
VALUES (
  'social_media',
  '{
    "facebook": "",
    "instagram": "",
    "tiktok": ""
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Verify the settings were added
SELECT key, value FROM site_settings WHERE key IN ('sale_timer', 'social_media');
