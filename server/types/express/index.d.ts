import { AuthUser } from '../user';

declare global {
    namespace Express {
        export interface Request {
            user?: AuthUser;
        }
    }
}
