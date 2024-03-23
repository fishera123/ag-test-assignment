import config from "config/config";
import winston, { format } from "winston";

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: config.NODE_ENV === "development" ? "debug" : "info",
      format: format.combine(
        format.colorize(),
        format.errors({ stack: true }),
        format.timestamp(),
        format.align(),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public debug(message: string): void {
    this.logger.debug(message);
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public error(message: string | Error): void {
    this.logger.error(message);
  }
}
