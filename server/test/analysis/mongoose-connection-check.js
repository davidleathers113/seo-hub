const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function checkMongoDBServer(server) {
    const checks = {
        serverExists: false,
        uriValid: false,
        portAvailable: false,
        serverReady: false
    };

    try {
        // Check server exists
        checks.serverExists = !!server;
        console.log('MongoDB Server exists:', checks.serverExists);

        if (checks.serverExists) {
            // Check URI
            const uri = await server.getUri();
            checks.uriValid = uri.startsWith('mongodb://');
            console.log('MongoDB URI valid:', checks.uriValid, uri);

            // Check port
            const port = await server.getPort();
            checks.portAvailable = port > 0;
            console.log('MongoDB Port available:', checks.portAvailable, port);

            // Check server ready
            const running = await server.isRunning();
            checks.serverReady = running;
            console.log('MongoDB Server running:', checks.serverReady);
        }
    } catch (error) {
        console.error('MongoDB Server check failed:', error);
    }

    return checks;
}

async function checkMongooseConnection() {
    const checks = {
        optionsValid: false,
        connectionState: 'unknown',
        eventsRegistered: false,
        models: [],
        collections: []
    };

    try {
        // Check connection options
        const options = mongoose.connection.config || {};
        checks.optionsValid = true; // Add specific option validation if needed
        console.log('Mongoose options:', options);

        // Check connection state
        checks.connectionState = mongoose.STATES[mongoose.connection.readyState];
        console.log('Mongoose connection state:', checks.connectionState);

        // Check event listeners
        const events = mongoose.connection.eventNames();
        checks.eventsRegistered = events.length > 0;
        console.log('Mongoose events registered:', events);

        // Check models and collections
        checks.models = Object.keys(mongoose.models);
        checks.collections = mongoose.connection.collections 
            ? Object.keys(mongoose.connection.collections) 
            : [];
        console.log('Mongoose models:', checks.models);
        console.log('Mongoose collections:', checks.collections);

    } catch (error) {
        console.error('Mongoose connection check failed:', error);
    }

    return checks;
}

module.exports = {
    checkMongoDBServer,
    checkMongooseConnection
};
