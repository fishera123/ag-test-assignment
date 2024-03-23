import { Response } from "express";
import morgan from "morgan";
import config from "../config/config";
import { Logger } from "../helpers/logger";

const logger = Logger.getInstance();

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
morgan.token("message", (_, res: Response) => res.locals.errorMessage || "");

const getIpFormat = () => (config.NODE_ENV === "production" ? ":remote-addr - " : "");

export const loggerMiddleware = morgan((tokens, req, res) => {
  const status = <string>tokens.status(req, res);
  const level = status >= "400" ? "error" : "info";
  const message = [
    getIpFormat(),
    tokens.method(req, res),
    tokens.url(req, res),
    status,
    "-",
    tokens["response-time"](req, res),
    "ms",
    status >= "400" ? `- message: ${tokens.message(req, res) || ""}` : "",
  ].join(" ");

  logger[level](message.trim());
  return null;
});
