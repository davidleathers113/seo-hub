import winston from 'winston';

const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export function logger(namespace: string) {
  return {
    info: (message: string, ...args: any[]) => winstonLogger.info(`[${namespace}] ${message}`, ...args),
    error: (message: string, ...args: any[]) => winstonLogger.error(`[${namespace}] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => winstonLogger.warn(`[${namespace}] ${message}`, ...args),
    debug: (message: string, ...args: any[]) => winstonLogger.debug(`[${namespace}] ${message}`, ...args)
  };
}