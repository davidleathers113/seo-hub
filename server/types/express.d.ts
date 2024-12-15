import { User } from '../database/interfaces';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
