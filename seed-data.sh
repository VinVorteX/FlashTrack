#!/bin/bash

# Seed data for FlashTrack database

echo "Seeding database with initial data..."

# Connect to PostgreSQL and insert seed data
docker compose exec -T postgres psql -U postgres -d flashtrack << 'EOF'

-- Insert societies
INSERT INTO societies (id, name, address) VALUES 
(1, 'Sunrise Apartments', 'Mumbai, Maharashtra')
ON CONFLICT (id) DO NOTHING;

-- Insert categories
INSERT INTO categories (id, name) VALUES 
(1, 'Plumbing'),
(2, 'Electrical'),
(3, 'Maintenance'),
(4, 'Security'),
(5, 'Cleanliness')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences to proper values
SELECT setval('societies_id_seq', (SELECT MAX(id) FROM societies));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

EOF

echo "✅ Database seeded successfully!"
echo ""
echo "Available Categories:"
echo "  1. Plumbing"
echo "  2. Electrical"
echo "  3. Maintenance"
echo "  4. Security"
echo "  5. Cleanliness"
echo ""
echo "Society ID: 1 (Sunrise Apartments)"
