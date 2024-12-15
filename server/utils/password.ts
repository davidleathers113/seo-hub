import bcrypt from 'bcrypt';
import { logger } from './log';

const log = logger('utils/password');

export async function generatePasswordHash(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    log.info('Generated password hash:', { hash });
    return hash;
  } catch (error) {
    log.error('Error generating password hash:', { error: (error as Error).message, stack: (error as Error).stack });
    throw new Error('Failed to hash password');
  }
}

export async function validatePassword(password: string, hash: string): Promise<boolean> {
  try {
    log.info('Validating password:', { 
      passwordLength: password?.length,
      hashLength: hash?.length,
      hash
    });

    if (!password || !hash) {
      log.error('Invalid input:', { 
        hasPassword: !!password,
        hasHash: !!hash,
        passwordLength: password?.length,
        hashLength: hash?.length
      });
      return false;
    }

    const isValid = await bcrypt.compare(password, hash);
    log.info('Password validation result:', { 
      isValid,
      passwordLength: password.length,
      hashLength: hash.length
    });
    return isValid;
  } catch (error) {
    log.error('Error validating password:', { 
      error: (error as Error).message, 
      stack: (error as Error).stack,
      passwordLength: password?.length,
      hashLength: hash?.length
    });
    return false;
  }
}

export function isPasswordHash(str: string): boolean {
  const isValid = /^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/.test(str);
  log.info('Checking if string is password hash:', { isValid, length: str?.length });
  return isValid;
}
