# Admin Control Pages - Quick Setup Guide

## New Admin Features

You now have full control over the homepage sections:

### 1. Hero Image Control - `/admin/hero-image`
- Upload a single hero image
- Set title, button text, and link
- Live preview

### 2. Top Bar Messages - `/admin/top-bar-messages`
- Add multiple messages (Arabic + English)
- Messages auto-rotate every 3 seconds
- Smooth slide animation

### 3. Marquee Banner - `/admin/marquee-banner`
- Control the scrolling text banner
- Toggle active/inactive

---

## Setup Instructions

### Step 1: Run the Database Migration

Open **Supabase SQL Editor** and run:

```sql
INSERT INTO site_settings (key, value, description)
VALUES
  ('hero_image', '{"image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop", "title": "Winter Collection", "button_text": "Shop Now", "button_link": "/products"}', 'Hero/Slider image configuration'),
  ('marquee_text', '{"text": "FREE SHIPPING ON All Orders", "is_active": true}', 'Marquee banner text configuration')
ON CONFLICT (key) DO NOTHING;
```

### Step 2: Access Admin Pages

Navigate to:
- `/admin/hero-image`
- `/admin/top-bar-messages`
- `/admin/marquee-banner`

### Step 3: Configure Your Settings

1. **Hero Image**: Upload your main homepage image
2. **Top Bar Messages**: Add your promotional messages
3. **Marquee Banner**: Set your scrolling text

---

## Features

✅ **Default Values**: App works immediately with sensible defaults
✅ **Live Preview**: See changes before saving
✅ **Auto-Rotation**: Top bar messages rotate every 3 seconds
✅ **Fully Dynamic**: All changes reflect on homepage instantly

---

## Troubleshooting

**If you see default content:**
- Run the migration SQL above
- Or configure settings in admin pages

**If images don't upload:**
- Check Supabase storage bucket `product-images` exists
- Verify storage policies allow uploads

**If messages don't rotate:**
- Add multiple active messages in `/admin/top-bar-messages`
- Each message needs `is_active` checked

---

Enjoy your new admin control! 🎉
