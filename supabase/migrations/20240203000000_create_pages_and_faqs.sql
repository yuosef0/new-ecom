-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faq_items table
CREATE TABLE IF NOT EXISTS faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial pages content
INSERT INTO pages (slug, title, content) VALUES
('about', 'About RiLIKS', '<p>Founded in 2024, RiLIKS emerged from a desire to bring high-quality, accessible fashion to the Egyptian market. We noticed a gap between premium international brands and local offerings – and set out to bridge it.</p><p>What started as a small curated collection has grown into a comprehensive fashion destination. We believe that style shouldn''t come at the cost of comfort or quality. Every piece in our collection is hand-picked and tested to meet our rigorous standards.</p>'),
('contact', 'Get in Touch', '<p>Have questions about your order or need style advice? We''re here to help.</p>'),
('faqs', 'Frequently Asked Questions', '<p>Quick answers to common questions about our products and services.</p>'),
('shipping', 'Shipping & Delivery', '<p>Everything you need to know about getting your order.</p>'),
('returns', 'Return & Exchange', '<p>We want you to love what you ordered. If something isn''t right, let us know.</p>'),
('privacy', 'Privacy Policy', '<p>RiLIKS ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>');

-- Seed initial FAQ items
INSERT INTO faq_items (category, question, answer, sort_order) VALUES
('Orders & Shipping', 'How do I track my order?', 'Once your order is shipped, you will receive an email and SMS with a tracking number. You can also track it directly from the ''My Orders'' section in your account.', 10),
('Orders & Shipping', 'How long does delivery take?', 'Standard delivery within Cairo takes 2-3 business days. For other governorates, it usually takes 3-5 business days.', 20),
('Orders & Shipping', 'Do you ship internationally?', 'Currently, we only ship within Egypt. We plan to expand internationally soon.', 30),
('Returns & Refunds', 'What is your return policy?', 'We offer a 14-day return policy for unworn items in their original condition with tags attached. Sale items are final sale.', 40),
('Returns & Refunds', 'How do I request a return?', 'Go to ''My Orders'', select the order, and click ''Request Return''. Our courier will pick up the item within 48 hours.', 50),
('Returns & Refunds', 'When will I get my refund?', 'Refunds are processed within 5-7 business days after we receive and inspect the returned item.', 60),
('Products & Sizing', 'How do I know my size?', 'Check our Size Guide linked on every product page. If you''re unsure, feel free to contact our support team for advice.', 70),
('Products & Sizing', 'Are your products authentic?', 'Yes, all our products are 100% authentic and sourced directly from manufacturers or authorized distributors.', 80);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- Policies for pages
CREATE POLICY "Public pages are viewable by everyone" ON pages
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert pages" ON pages
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.jwt() ->> 'email' = 'admin@riliks.com');

CREATE POLICY "Admins can update pages" ON pages
    FOR UPDATE USING (auth.role() = 'service_role' OR auth.jwt() ->> 'email' = 'admin@riliks.com');

-- Policies for faq_items
CREATE POLICY "Public faqs are viewable by everyone" ON faq_items
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert faqs" ON faq_items
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.jwt() ->> 'email' = 'admin@riliks.com');

CREATE POLICY "Admins can update faqs" ON faq_items
    FOR UPDATE USING (auth.role() = 'service_role' OR auth.jwt() ->> 'email' = 'admin@riliks.com');

CREATE POLICY "Admins can delete faqs" ON faq_items
    FOR DELETE USING (auth.role() = 'service_role' OR auth.jwt() ->> 'email' = 'admin@riliks.com');
