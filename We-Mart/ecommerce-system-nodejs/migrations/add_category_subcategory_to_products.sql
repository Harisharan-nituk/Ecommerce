-- Migration: Add category, subcategory, brand fields to products table
-- Run this migration if using MySQL database

-- Add category column
ALTER TABLE tbl_products 
ADD COLUMN category VARCHAR(50) NULL AFTER category_id,
ADD INDEX idx_category (category);

-- Add subcategory column
ALTER TABLE tbl_products 
ADD COLUMN subcategory VARCHAR(100) NULL AFTER category,
ADD INDEX idx_subcategory (subcategory);

-- Add composite index for faster category/subcategory queries
ALTER TABLE tbl_products 
ADD INDEX idx_category_subcategory (category, subcategory);

-- Add index for category and status (common filter combination)
ALTER TABLE tbl_products 
ADD INDEX idx_category_status (category, status);

-- Note: brand and brand_id columns should already exist
-- If not, uncomment the following:
-- ALTER TABLE tbl_products 
-- ADD COLUMN brand VARCHAR(100) NULL AFTER subcategory,
-- ADD INDEX idx_brand (brand);
