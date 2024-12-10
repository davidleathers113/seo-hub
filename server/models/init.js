const mongoose = require('mongoose');

// Import all models in dependency order
require('./User');
require('./Niche');
require('./Pillar');
require('./Subpillar');
require('./Research');
require('./Outline');

// Export the mongoose connection
module.exports = mongoose.connection;
