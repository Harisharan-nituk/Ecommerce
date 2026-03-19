-- Migration: Add sizes column to tbl_products
-- This migration adds a sizes column to store product sizes as JSON array

ALTER TABLE tbl_products 
ADD COLUMN sizes TEXT NULL COMMENT 'JSON array of available sizes (e.g., ["S", "M", "L", "XL", "XXL"])' 
AFTER image_urls;

-- Example of how sizes will be stored:
-- ["S", "M", "L", "XL", "XXL"]
-- ["Free Size"]
-- NULL (for products without sizes)
