
#!/usr/bin/env node

const { updateRouteFiles } = require('./utils/routeUpdater');

async function main() {
    try {
        await updateRouteFiles();
        console.log('Successfully updated route files');
    } catch (error) {
        console.error('Failed to update route files:', error);
        process.exit(1);
    }
}

main();