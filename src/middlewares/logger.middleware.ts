import morgan from "morgan";
import config from "../config/config";
import { NextFunction, Request, Response } from "express";
import { Logger } from "../helpers/logger";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
morgan.token("message", (_, res: Response) => res.locals.errorMessage || "");

const getIpFormat = () => (config.NODE_ENV === "production" ? ":remote-addr - " : "");

const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

export const loggerMiddleware = (_: Request, res: Response, next: NextFunction) => {
  if (res.statusCode >= 400) {
    morgan(errorResponseFormat, {
      skip: (_, res) => res.statusCode < 400,
      stream: { write: message => Logger.error(message.trim()) },
    });
    next();
  } else {
    morgan(successResponseFormat, {
      skip: (_, res) => res.statusCode >= 400,
      stream: { write: message => Logger.info(message.trim()) },
    });

    next();
  }
};
