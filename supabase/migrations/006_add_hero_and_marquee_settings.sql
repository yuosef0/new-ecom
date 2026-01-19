-- Add settings for hero image and marquee text

INSERT INTO site_settings (key, value)
VALUES
  ('hero_image', '{"image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop", "title": "Winter Collection", "button_text": "Shop Now", "button_link": "/products"}'),
  ('marquee_text', '{"text": "FREE SHIPPING ON All Orders", "is_active": true}')
ON CONFLICT (key) DO NOTHING;
