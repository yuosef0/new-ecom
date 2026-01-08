-- ============================================
-- DXLR E-Commerce Platform - Indexes
-- Migration 003
-- ============================================

-- ============================================
-- PRODUCTS INDEXES
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- Full-text search (simple tokenizer for mixed content)
CREATE INDEX idx_products_search ON products
  USING GIN(to_tsvector('simple', name || ' ' || COALESCE(description, '')));

-- ============================================
-- PRODUCT VARIANTS INDEXES
-- ============================================
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_stock ON product_variants(stock_quantity);
CREATE INDEX idx_variants_low_stock ON product_variants(product_id)
  WHERE stock_quantity <= low_stock_threshold AND stock_quantity > 0;
CREATE INDEX idx_variants_out_of_stock ON product_variants(product_id)
  WHERE stock_quantity = 0;

-- ============================================
-- ORDERS INDEXES
-- ============================================
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_paymob ON orders(paymob_order_id) WHERE paymob_order_id IS NOT NULL;

-- ============================================
-- ORDER ITEMS INDEXES
-- ============================================
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- CATEGORIES INDEXES
-- ============================================
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- ============================================
-- COLLECTIONS INDEXES
-- ============================================
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_featured ON collections(is_featured) WHERE is_featured = true;
CREATE INDEX idx_collections_active ON collections(is_active);

-- ============================================
-- WISHLIST INDEXES
-- ============================================
CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_product ON wishlist_items(product_id);

-- ============================================
-- ADDRESSES INDEXES
-- ============================================
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id) WHERE is_default = true;

-- ============================================
-- PRODUCT IMAGES INDEXES
-- ============================================
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id) WHERE is_primary = true;

-- ============================================
-- PROMO CODES INDEXES
-- ============================================
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
