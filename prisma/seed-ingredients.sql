-- Seed data: Add sample ingredients for testing
INSERT INTO "Ingredient" (id, name, unit, "currentStock", "minStock", "costPerUnit", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Tomatoes', 'KILOGRAM', 50, 10, 2.50, NOW(), NOW()),
  (gen_random_uuid(), 'Onions', 'KILOGRAM', 30, 5, 1.20, NOW(), NOW()),
  (gen_random_uuid(), 'Cheese', 'KILOGRAM', 15, 5, 8.00, NOW(), NOW()),
  (gen_random_uuid(), 'Olive Oil', 'LITER', 10, 2, 12.00, NOW(), NOW()),
  (gen_random_uuid(), 'Flour', 'KILOGRAM', 100, 20, 0.80, NOW(), NOW()),
  (gen_random_uuid(), 'Chicken Breast', 'KILOGRAM', 25, 10, 6.50, NOW(), NOW()),
  (gen_random_uuid(), 'Lettuce', 'PIECE', 20, 5, 1.50, NOW(), NOW()),
  (gen_random_uuid(), 'Salt', 'KILOGRAM', 5, 1, 0.50, NOW(), NOW());
