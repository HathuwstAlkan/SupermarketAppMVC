-- Migration 6: Add order tracking and delivery time fields
-- Phase D: Order Tracking & Delivery Estimates
-- Run this SIXTH (last migration)

-- Add tracking fields to orders table
ALTER TABLE orders
ADD COLUMN estimated_delivery_time DATETIME AFTER status,
ADD COLUMN actual_delivery_time DATETIME DEFAULT NULL AFTER estimated_delivery_time,
ADD COLUMN tracking_notes TEXT AFTER actual_delivery_time;

-- Update existing orders with estimated delivery times (retroactive, 6 hours from creation)
UPDATE orders 
SET estimated_delivery_time = DATE_ADD(created_at, INTERVAL 6 HOUR)
WHERE estimated_delivery_time IS NULL;
