-- Add settings for hero image and marquee text

-- Site settings for global configurations
INSERT INTO site_settings (key, value, description)
VALUES
  ('hero_image', '{"image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop", "title": "Winter Collection", "button_text": "Shop Now", "button_link": "/products"}', 'Hero/Slider image configuration'),
  ('marquee_text', '{"text": "FREE SHIPPING ON All Orders", "is_active": true}', 'Marquee banner text configuration')
ON CONFLICT (key) DO NOTHING;
