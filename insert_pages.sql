-- Insert static pages into the database
-- Run this SQL in your Supabase SQL Editor

INSERT INTO pages (slug, title, content) VALUES
('about', 'About RiLIKS', '<p>Founded in 2024, RiLIKS emerged from a desire to bring high-quality, accessible fashion to the Egyptian market. We noticed a gap between premium international brands and local offerings – and set out to bridge it.</p><p>What started as a small curated collection has grown into a comprehensive fashion destination. We believe that style shouldn''t come at the cost of comfort or quality. Every piece in our collection is hand-picked and tested to meet our rigorous standards.</p>'),
('contact', 'Get in Touch', '<p>Have questions about your order or need style advice? We''re here to help.</p>'),
('privacy', 'Privacy Policy', '<p>RiLIKS ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>'),
('shipping', 'Shipping & Delivery', '<p>Everything you need to know about getting your order.</p>'),
('returns', 'Return & Exchange', '<p>We want you to love what you ordered. If something isn''t right, let us know.</p>')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = NOW();
