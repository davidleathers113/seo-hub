const mongoose = require('mongoose');

function logConnectionState() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };

  return {
    readyState: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.models),
    collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections) : [],
    client: mongoose.connection.getClient ? 'available' : 'not available'
  };
}

module.exports = { logConnectionState };
