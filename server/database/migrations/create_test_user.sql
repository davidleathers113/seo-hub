-- Insert test user with ID matching the dev token
INSERT INTO users (
    id,
    email,
    password,
    name,
    role,
    is_active
)
VALUES (
    'be2fd6c8-e974-4927-ab4e-d182ec3c369b',  -- ID from dev token
    'test@example.com',                       -- Email from dev token
    '$2b$10$6Bnv6WVAT0o/P.43ZcQSx.5bn9X7NkXqUrtC3N4dhcXGxgG/Zk3.e',  -- Hashed password for 'password123'
    'Test User',
    'user',
    true
)
ON CONFLICT (id) DO NOTHING;  -- Skip if user already exists
