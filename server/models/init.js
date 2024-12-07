const mongoose = require('mongoose');
require('./User');

// Add any additional model imports here as your application grows

// Export the mongoose connection
module.exports = mongoose.connection;
