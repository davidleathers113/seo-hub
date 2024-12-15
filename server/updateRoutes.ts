#!/usr/bin/env node

import { updateRouteFiles } from './utils/routeUpdater';

async function main(): Promise<void> {
    try {
        await updateRouteFiles();
        console.log('Successfully updated route files');
    } catch (error) {
        console.error('Failed to update route files:', error);
        process.exit(1);
    }
}

main();