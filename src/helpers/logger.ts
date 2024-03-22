import config from "config/config";
import winston, { format } from "winston";

export class Logger {
  private static logger: winston.Logger;

  private constructor() {
    Logger.logger = winston.createLogger({
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
  public debug(message: string): void {
    Logger.logger.debug(message);
  }

  public static debug(message: string): void {
    Logger.logger.debug(message);
  }

  public info(message: string): void {
    Logger.logger.info(message);
  }

  public static info(message: string): void {
    Logger.logger.info(message);
  }

  public error(message: string | Error): void {
    Logger.logger.error(message);
  }

  public static error(message: string | Error): void {
    Logger.logger.error(message);
  }
}
