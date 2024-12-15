import net from 'net';
import { logger } from './log';

const log = logger('port-utils');

export async function portInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => {
        log.warn(`Port ${port} is already in use`);
        resolve(true);
      })
      .once('listening', () => {
        server.close();
        log.info(`Port ${port} is available`);
        resolve(false);
      })
      .listen(port);
  });
}
