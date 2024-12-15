export * from './base';
export * from './user';
export * from './structure';
export * from './content';
export * from './workflow';

import { BaseClient } from './base';
import { UserClient } from './user';
import { StructureClient } from './structure';
import { ContentClient } from './content';
import { WorkflowClient } from './workflow';

// Main database client interface that combines all specialized interfaces
export interface DatabaseClient extends 
    BaseClient,
    UserClient,
    StructureClient,
    ContentClient,
    WorkflowClient {}
