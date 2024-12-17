-- Rename policies to follow convention
ALTER POLICY "Users can view their own data" ON users RENAME TO select_users_policy;
ALTER POLICY "Users can update their own data" ON users RENAME TO update_users_policy;

ALTER POLICY "Users can view their own niches" ON niches RENAME TO select_niches_policy;
ALTER POLICY "Users can insert their own niches" ON niches RENAME TO insert_niches_policy;
ALTER POLICY "Users can update their own niches" ON niches RENAME TO update_niches_policy;
ALTER POLICY "Users can delete their own niches" ON niches RENAME TO delete_niches_policy;

-- Continue for other policies...