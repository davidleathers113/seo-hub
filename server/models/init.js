const @supabase/supabase-js = require('@supabase/supabase-js');

// Import all models in dependency order
require('./User');
require('./Niche');
require('./Pillar');
require('./Subpillar');
require('./Research');
require('./Outline');
require('./Article');
require('./TestFixture');

// Export the @supabase/supabase-js connection
module.exports = @supabase/supabase-js.connection;
